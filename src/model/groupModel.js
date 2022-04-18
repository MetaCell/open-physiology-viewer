import {Resource} from './resourceModel';
import {Node} from './verticeModel';
import {Link} from './edgeModel';
import {Lyph} from './shapeModel';

import {isObject, unionBy, merge, keys, entries, isArray, pick, isString} from 'lodash-bound';
import {
    getGenID,
    addColor,
    $SchemaClass,
    $Field,
    $Color,
    $Prefix,
    findResourceByID,
    showGroups, schemaClassModels, getRefNamespace, getFullID, getNewID
} from './utils';
import {logger, $LogMsg} from './logger';

/**
 * Group (subgraph) in the connectivity model
 * @class
 * @property nodes
 * @property links
 * @property regions
 * @property lyphs
 * @property materials
 * @property references
 * @property groups
 * @property trees
 * @property channels
 * @property chains
 * @property coalescences
 * @property scaffolds
 * @property hostedBy
 */
export class Group extends Resource {
    /**
     * Create a graph model from the JSON specification
     * @param json - input model
     * @param modelClasses - model resource classes
     * @param entitiesByID - global map of model resources
     * @param defaultNamespace
     * @returns {*} - Graph model - model suitable for visualization
     */
    static fromJSON(json, modelClasses = {}, entitiesByID, defaultNamespace) {
        json.class = json.class || $SchemaClass.Group;

        modelClasses.Chain.validateRoots(json.chains, json.nodes);

        let namespace = json.namespace || defaultNamespace;
        if (json.generated) {
            return super.fromJSON(json, modelClasses, entitiesByID, namespace);
        }

        //replace references to templates
        if (json.lyphsByID) {
            this.replaceReferencesToTemplates(json);
        }

        //create group resources from templates
        this.expandGroupTemplates(json, modelClasses);

        //create lyphs that inherit properties from templates
        this.expandLyphTemplates(json, modelClasses);

        //create villus
        this.expandVillusTemplates(json, modelClasses);

        /******************************************************************************************************/
        /*the following methods have to be called after expandLyphTemplates to have access to generated layers*/

        //align generated groups and housing lyphs
        (json.chains || []).forEach(chain => modelClasses.Chain.embedToHousingLyphs(json, chain));

        //create instances of group templates (e.g., trees and channels)
        this.createTemplateInstances(json, modelClasses);

        //Clone nodes simultaneously required to be on two or more lyph borders
        modelClasses.Node.replicateBorderNodes(json, modelClasses);

        //Clone nodes simultaneously required to be on two or more lyphs
        modelClasses.Node.replicateInternalNodes(json, modelClasses);

        //Reposition internal resources
        modelClasses.Lyph.mapInternalResourcesToLayers(json);

        /******************************************************************************************************/
        //create graph resource
        let res  = super.fromJSON(json, modelClasses, entitiesByID, namespace);
        //copy nested references to resources to the parent group
        res.mergeSubgroupResources();

        //Assign color to visual resources with no color in the spec
        addColor(res.links, $Color.Link);
        addColor(res.lyphs);

        res.assignScaffoldComponents();
        return res;
    }

    contains(resource){
        if (resource instanceof Node){
            return findResourceByID(this.nodes, resource.id);
        }
        if (resource instanceof Lyph){
            return findResourceByID(this.lyphs, resource.id);
        }
        if (resource instanceof Link){
            return findResourceByID(this.links, resource.id);
        }
        return false;
    }

    /**
     * Include related to resources to the group: node clones, internal lyphs and nodes
     */
    includeRelated(){
        //Add auto-created clones of boundary nodes and collapsible links, conveying lyphs,
        //internal nodes and internal lyphs to the group that contains the original lyph
        [$Field.nodes, $Field.links, $Field.lyphs].forEach(prop => {
            this[prop].forEach(res => res.includeRelated && res.includeRelated(this));
            //TODO why not all nodes marked as hidden: keastSpinalFull
            this[prop].hidden = this.hidden;
        });

        //If a group is hosted by a region, each its lyph is hosted by the region
        let host = this.hostedBy || this.generatedFrom && this.generatedFrom.hostedBy;
        if (host && host::isObject()){
            host.hostedLyphs = host.hostedLyphs || [];
            (this.links||[]).filter(link => link.conveyingLyph && !link.conveyingLyph.internalIn).forEach(link => {
                link.conveyingLyph.hostedBy = host;
                if (!host.hostedLyphs.find(e => e.id === link.conveyingLyph.id)){
                    host.hostedLyphs.push(link.conveyingLyph);
                }
            });
            (this.nodes||[]).forEach(node => node.charge = 20);
        }
    }

    createGroup(groupID, name, nodes, links, lyphs, modelClasses){
        const resources = {
            [$Field.nodes]: nodes,
            [$Field.links]: links,
            [$Field.lyphs]: lyphs
        }
        let group = (this.groups||[]).find(g => g.id === groupID);
        let json = group || {
            [$Field.id]    : groupID,
            [$Field.name]  : name
        }
        if (group) {
            [$Field.nodes, $Field.links, $Field.lyphs].forEach(prop => {
                group[prop] = (group[prop]||[])::unionBy(resources[prop], $Field.id);
                group[prop] = group[prop].filter(x => !!x && x.class);
            });
        } else {
            [$Field.nodes, $Field.links, $Field.lyphs].forEach(prop => json[prop] = resources[prop].map(e => e.id));
            group = modelClasses.Group.fromJSON(json, modelClasses, this.entitiesByID, this.namespace);
            this.groups.push(group);
        }
        group.description = "dynamic";
        return group;
    }

    includeLyphAxes(lyphs, links){
        links = links || [];
        (lyphs||[]).forEach(lyph => {
            if (lyph.conveys) {
                if (!findResourceByID(links, lyph.conveys.id)) {
                    links.push(lyph.conveys);
                }
            }
        });
    };

    includeLinkEnds(links, nodes){
        nodes = nodes || [];
        (links||[]).forEach(lnk => {
            if (!findResourceByID(nodes, lnk.source.id)){
                nodes.push(lnk.source);
            }
            if (!findResourceByID(nodes, lnk.target.id)){
                nodes.push(lnk.target);
            }
        });
        (this.links||[]).forEach(lnk => {
            if (lnk.collapsible &&
                findResourceByID(nodes, lnk.source.id) && findResourceByID(nodes, lnk.target.id)){
                links.push(lnk);
            }
        });
    };

    includeConveyingLyphs(links, lyphs){
        lyphs = lyphs || [];
        (links||[]).forEach(lnk => {
            if (lnk.conveyingLyph) {
                if (!findResourceByID(lyphs, lnk.conveyingLyph.id)) {
                    lyphs.push(lnk.conveyingLyph);
                }
            }
        });
    };

    /**
     * Replace references to lyph templates with references to auto-generated lyphs that inherit properties from templates
     * @param json - input model
     */
    static replaceReferencesToTemplates(json){

        let changedLyphs = 0;
        let changedMaterials = 0;

        const replaceRefToTemplate = (ref, parent, ext = null) => {
            let nm = getRefNamespace(ref, json.namespace);
            let template = json.lyphsByID[getFullID(nm, ref)];
            if (template && template.isTemplate) {
                changedLyphs++;
                let subtype = {
                    [$Field.id]        : getGenID($Prefix.template, ref, parent.id, ext),
                    [$Field.namespace] : nm,
                    [$Field.name]      : template.name,
                    [$Field.supertype] : template.id,
                    [$Field.skipLabel] : true,
                    [$Field.generated] : true
                };
                if (!json.lyphsByID[getFullID(nm, subtype.id)]) {
                    json.lyphsByID[getFullID(nm, subtype.id)] = subtype;
                    json.lyphs = json.lyphs || []
                    json.lyphs.push(subtype);
                    replaceAbstractRefs(subtype, $Field.layers);
                }
                return subtype.id;
            }
            return ref;
        };

        const replaceAbstractRefs = (resource, key) => {
            if (!resource[key]) { return; }

            const replaceRefToMaterial = (ref) => {
                let nm = getRefNamespace(ref, json.namespace);
                let lyphID = getGenID($Prefix.material, ref);
                let template = json.lyphsByID[getFullID(nm, lyphID)];
                if (!template || !template.isTemplate) {
                    let material = json.materialsByID[getFullID(nm, ref)];
                    if (material) {
                        template = {
                            [$Field.id]: lyphID,
                            [$Field.namespace]: nm,
                            [$Field.name]: material.name,
                            [$Field.isTemplate]: true,
                            [$Field.materials]: [material.id],
                            [$Field.generatedFrom]: material.id,
                            [$Field.skipLabel]: true,
                            [$Field.generated]: true
                        };
                        template::merge(material::pick([$Field.name, $Field.external, $Field.ontologyTerms, $Field.color]));
                        //TODO copy all materials
                        json.lyphs.push(template);
                        json.lyphsByID[getFullID(nm, lyphID)] = template;
                    } else {
                        if (nm !== json.namespace){
                            logger.error($LogMsg.MATERIAL_REF_NOT_FOUND, resource.id, ref);
                        }
                    }
                }
                if (template){
                    return template.id;
                }
                return ref;
            };

            const replaceLyphTemplates = ![$Field.subtypes, $Field.supertype, $Field.lyphTemplate, $Field.housingLyphs
                //, $Field.lyphs // NK property "lyphs" are needed for coalescences?
            ].includes(key);
            if (resource[key]::isArray()) {
                resource[key] = resource[key].map(ref => replaceRefToMaterial(ref));
                if (replaceLyphTemplates){
                    resource[key] = resource[key].map((ref, idx) => replaceRefToTemplate(ref, resource, idx));
                }
            } else {
                resource[key] = replaceRefToMaterial(resource[key]);
                if (replaceLyphTemplates) {
                    resource[key] = replaceRefToTemplate(resource[key], resource);
                }
            }
        };

        (json::entries()||[]).forEach(([relName, resources]) => {
            if (!resources::isArray()) { return; }
            let classNames = schemaClassModels[$SchemaClass.Group].relClassNames;
            if (classNames[relName]) {
                let refsToLyphs = schemaClassModels[classNames[relName]].selectedRelNames($SchemaClass.Lyph);
                if (!refsToLyphs){ return; }
                (resources || []).forEach(resource => {
                    (resource::keys() || []).forEach(key => { // Do not replace valid references to templates
                        if (refsToLyphs.includes(key)) { replaceAbstractRefs(resource, key); }
                    })
                })
            }
        });
        if (changedLyphs > 0){
            logger.info($LogMsg.GROUP_REF_TO_LYPH, changedLyphs);
        }
        if (changedMaterials > 0){
            logger.info($LogMsg.GROUP_REF_TO_MAT, changedMaterials);
        }
    }

    /**
     * Generate groups from group templates, i.e. auto-create necessary nodes and links conveying given or generated lyphs
     * @param parentGroup - input model
     * @param modelClasses - model resource classes
     */
    static expandGroupTemplates(parentGroup, modelClasses){
        if (!modelClasses || modelClasses === {}){ return; }
        let relClassNames = schemaClassModels[$SchemaClass.Group].relClassNames;
        [$Field.channels, $Field.chains].forEach(relName => {
            let clsName = relClassNames[relName];
            if (!clsName){
                logger.error($LogMsg.GROUP_TEMPLATE_NO_CLASS, relName);
            }
            (parentGroup[relName]||[]).forEach((template, i) => {
                if (template::isObject()) {//expand group templates, but not references
                    template.id = template.id || getGenID(parentGroup.id, relName, i);
                    modelClasses[clsName].expandTemplate(parentGroup, template);
                } else {
                    logger.info($LogMsg.GROUP_TEMPLATE_OTHER, template);
                    parentGroup[$Field.groups] = parentGroup[$Field.groups] || [];
                    parentGroup[$Field.groups].push(getGenID($Prefix.group, template));
                }
            });
        });
    }

    /**
     * Generate group template instances
     * @param json - input model
     * @param modelClasses - model resource classes
     */
    static createTemplateInstances(json, modelClasses){
        if (!modelClasses){ return; }

        let relClassNames = schemaClassModels[$SchemaClass.Group].relClassNames;
        [$Field.trees, $Field.channels].forEach(relName => {
            let clsName = relClassNames[relName];
            if (!clsName){
                logger.error($LogMsg.GROUP_TEMPLATE_NO_CLASS, relName);
            }
            (json[relName]||[]).forEach(field => modelClasses[clsName].createInstances(json, field));
        })
    }

    /**
     * Create lyphs that inherit properties from templates
     * @param parentGroup
     * @param modelClasses - model resource classes
     */
    static expandLyphTemplates(parentGroup, modelClasses){
        let templates = (parentGroup.lyphs||[]).filter(lyph => lyph.isTemplate);
        templates.forEach(template => modelClasses.Lyph.expandTemplate(parentGroup, template));
        templates.forEach(template => delete template._inactive);
    }

    /**
     * Generate subgraphs to model villi
     * @param json - input model
     * @param modelClasses - model resource classes
     */
    static expandVillusTemplates(json, modelClasses){
        (json.lyphs||[]).forEach(lyph => {
            if (lyph.villus) {
                lyph.villus.villusOf = lyph.id;
                modelClasses.Villus.expandTemplate(json, lyph.villus);
            }
        });
    }

    /**
     * Add resources from subgroups to the current group
     */
    mergeSubgroupResources(){
        //Place references to subgroup resources to the current group
        let relFieldNames = schemaClassModels[$SchemaClass.Group].filteredRelNames([$SchemaClass.GroupTemplate])
            .filter(prop => ![$Field.seed, $Field.seedIn].includes(prop));
        (this.groups||[]).forEach(group => {
            if (group.id === this.id) {
                logger.warn($LogMsg.GROUP_SELF, this.id, group.id);
                return;
            }
            relFieldNames.forEach(prop => {
                if (group[prop]::isArray()){
                    this[prop] = (this[prop]||[])::unionBy(group[prop], "fullID");
                    this[prop] = this[prop].filter(x => x && x.class);
                }
            });
        });
    }

    /**
     * Entities that belong to the group (resources excluding subgroups)
     * @returns {*[]}
     */
    get resources(){
        let res = [];
        let relFieldNames = schemaClassModels[$SchemaClass.Group].filteredRelNames([$SchemaClass.Group]);
        relFieldNames.forEach(property => res = res::unionBy((this[property] ||[]), $Field.id));
        return res::res.filter(r => !!r && r::isObject());
    }

    /**
     * Show subgroups of the current group. A resources is shown if it belongs to at least one visible subgroup
     * @param ids - selected subgroup identifiers
     */
    showGroups(ids){
        showGroups(this.groups||[], ids);
    }

    /**
     * Hide current group (=hide all its entities)
     */
    hide(){
        this.hidden = true;
        this.resources.forEach(entity => entity.hidden = true);
    }

    /**
     * Show current group (=show all its entities)
     */
    show(){
        this.hidden = false;
        this.resources.forEach(entity => delete entity.hidden);
    }

    /**
     * Groups that can be toggled on or off in the global graph
     * @returns {*[]}
     */
    get activeGroups(){
        return [...(this.groups||[])].filter(e => !e.inactive && (e.description !== "dynamic"));
    }

    get dynamicGroups(){
        return [...(this.groups||[])].filter(e => e.description === "dynamic");
    }

    get visibleGroups(){
        return [...(this.groups||[])].filter(e => !e.hidden);
    }

    assignScaffoldComponents(){
        const res = [...(this.scaffolds||[])];
        (this.scaffolds||[]).forEach(scaffold =>
            (scaffold.components||[]).forEach(component => {
                component._parent = scaffold;
                res.push(component);
            }));
        this.scaffoldComponents = res;
    }

    /**
     * Visible nodes
     * @returns {*[]}
     */
    get visibleNodes(){
        return (this.nodes||[]).filter(e => e.isVisible);
    }

    /**
     * Visible links
     * @returns {*[]}
     */
    get visibleLinks(){
        return (this.links||[]).filter(e => e.isVisible);
    }

    /**
     * Visible lyphs
     * @returns {*[]}
     */
    get visibleLyphs(){
       return (this.lyphs||[]).filter(e => e.isVisible && e.axis && e.axis.isVisible);
    }

    get create3d(){
        return (this.lyphs||[]).find(e => e.create3d);
    }
}

