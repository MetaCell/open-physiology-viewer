import {GroupTemplate} from './groupTemplateModel';
import {Lyph} from "./shapeModel";
import {Node} from "./verticeModel";
import {Link} from "./edgeModel";
import {Coalescence} from "./coalescenceModel";

import {
    mergeGenResource,
    findResourceByID,
    getNewID,
    getGenID,
    addBorderNode,
    getID,
    compareResources,
    getGenName,
    $Field,
    $Color,
    $Prefix, LYPH_TOPOLOGY, $SchemaClass
} from "./utils";
import {logger, $LogMsg} from './logger';
import {defaults, isObject, isArray, flatten} from 'lodash-bound';

/**
 * Chain model
 * @property lyphs
 * @property lyphTemplate
 * @property levels
 * @property numLevels
 * @property housingLyphs
 * @property housingChain
 * @property housingRange
 * @property housingLayers
 * @property wiredTo
 * @property startFromLeaf
 * @property hostedBy
 * @property root
 * @property leaf
 * @property chainTopology
 */
export class Chain extends GroupTemplate {

      static fromJSON(json, modelClasses = {}, entitiesByID, namespace) {
          json.class = json.class || $SchemaClass.Chain;
          let res = super.fromJSON(json, modelClasses, entitiesByID, namespace);
          if (!res.validateTopology()) {
            logger.error($LogMsg.CHAIN_WRONG_TOPOLOGY, res.id);
          }
          return res;
    }

    /**
     * Generate a group from chain template
     * @param parentGroup - model resources that may be referred from the template
     * @param chain - chain template in JSON
     */
    static expandTemplate(parentGroup, chain){
        if (!chain){
            logger.warn($LogMsg.CHAIN_UNDEFINED);
            return;
        }

        if (chain.generated){return;}

        chain.id = chain.id || getGenID($Prefix.chain, getNewID());
        chain.name = chain.name || getGenName(chain.name || chain.id, $Prefix.group);

        const isDefined = value => value && value::isArray() && value.length > 0;

        if ( !(chain.numLevels || isDefined(chain.levels) || isDefined(chain.lyphs) ||
            isDefined(chain.housingLyphs) || chain.housingChain)) {
            logger.warn($LogMsg.CHAIN_SKIPPED, chain);
            return;
        }

        chain.group = this.createTemplateGroup(chain, parentGroup);

        function getLyphTemplate(){
            let template = chain.lyphTemplate;
            if (template){
                if (template::isObject()){
                    if (!template.id) { template.id = getGenID($Prefix.template, chain.id); }
                    mergeGenResource(chain.group, parentGroup, template, $Field.lyphs);
                    chain.lyphTemplate = template.id;
                } else {
                    //find lyph template to establish chain topology
                    template = (parentGroup.lyphs||[]).find(e => e.id === chain.lyphTemplate);
                    if (!template){
                        logger.error($LogMsg.CHAIN_LYPH_TEMPLATE_MISSING, chain.lyphTemplate);
                    }
                }
            }
            return template;
        }

        function getLevelTopology(level, n, template){
            if (template){
                if (template.topology === Lyph.LYPH_TOPOLOGY.CYST && n === 1){
                    return Lyph.LYPH_TOPOLOGY.CYST;
                }
                if (level === 0 &&
                    [Lyph.LYPH_TOPOLOGY["BAG+"], Lyph.LYPH_TOPOLOGY.BAG2, Lyph.LYPH_TOPOLOGY.CYST].includes(template.topology)) {
                    return Lyph.LYPH_TOPOLOGY.BAG2;
                }
                if (level === n - 1) {
                    if ([Lyph.LYPH_TOPOLOGY["BAG-"], Lyph.LYPH_TOPOLOGY.BAG, Lyph.LYPH_TOPOLOGY.CYST].includes(template.topology)) {
                        return Lyph.LYPH_TOPOLOGY.BAG;
                    }
                }
            }
            return Lyph.LYPH_TOPOLOGY.TUBE;
        }

        function deriveFromLyphs(){

            let lyphs = chain.lyphs.map(lyphID => findResourceByID(parentGroup.lyphs, lyphID) || {[$Field.id]: lyphID});

            if (chain.lyphTemplate){
                let lyphTemplate = getLyphTemplate();
                lyphs.forEach(subtype => {
                    if (!subtype.supertype && !isDefined(subtype.layers)){
                        subtype.supertype = chain.lyphTemplate;
                        Lyph.clone(parentGroup.lyphs, lyphTemplate, subtype)
                    }
                })
            }

            let conveyingMaterials = lyphs.filter(lyph => lyph.layers && lyph.layers[0] && lyph.layers[0].materials).map(lyph => lyph.layers[0].materials)::flatten();
            conveyingMaterials = [...new Set(conveyingMaterials)];

            if (conveyingMaterials.length > 0){
                logger.warn($LogMsg.CHAIN_MAT_DIFF, chain.lyphs);
            }

            const n = lyphs.length;
            let existingLinks = new Array(n);
            for (let i = 0; i < n; i++) {
                 existingLinks[i] = lyphs[i].conveys? findResourceByID(parentGroup.links, lyphs[i].id):
                    (parentGroup.links||[]).find(lnk => lnk.conveyingLyph === lyphs[i].id);
            }

            let nodeIDs = new Array(n + 1);
            nodeIDs[0] = chain.root;
            nodeIDs[n] = chain.leaf;

            let existingNodes = new Array(n + 1);
            existingNodes[0] = findResourceByID(parentGroup.nodes, chain.root);
            existingNodes[n] = findResourceByID(parentGroup.nodes, chain.leaf);

            for (let i = 0; i < n; i++) {
               if (existingLinks[i]) {
                   if (existingLinks[i].source) {
                       if (nodeIDs[i]) {
                           if (nodeIDs[i] !== existingLinks[i].source) {
                               logger.warn($LogMsg.CHAIN_NODE_CONFLICT, chain.id, i, existingLinks[i], nodeIDs[i], existingLinks[i].source);
                           }
                       } else {
                           nodeIDs[i] = existingLinks[i].source;
                       }
                   }
                   if (existingLinks[i].target) {
                       if (nodeIDs[i + 1]) {
                           if (nodeIDs[i + 1] !== existingLinks[i].target) {
                               logger.warn($LogMsg.CHAIN_NODE_CONFLICT, chain.id, i, existingLinks[i], nodeIDs[i+1], existingLinks[i].source);
                           }
                       } else {
                           nodeIDs[i + 1] = existingLinks[i].target;
                       }
                   }
               }
            }

            for (let i = 0; i < n + 1; i++) {
                nodeIDs[i] = nodeIDs[i] || getGenID(chain.id, $Prefix.node, i);
                let node = existingNodes[i] || {
                        [$Field.id]        : nodeIDs[i],
                        [$Field.color]     : $Color.InternalNode,
                        [$Field.val]       : 1,
                        [$Field.skipLabel] : true,
                        [$Field.generated] : true
                    };
                mergeGenResource(chain.group, parentGroup, node, $Field.nodes);
            }

            chain.levels = [];
            let prev;
            for (let i = 0; i < n; i++) {
                let link = existingLinks[i] || {
                    [$Field.id]                 : getGenID(chain.id, $Prefix.link, i + 1),
                    [$Field.source]             : chain.group.nodes[i],
                    [$Field.target]             : chain.group.nodes[i + 1],
                    [$Field.conveyingLyph]      : lyphs[i].id,
                    [$Field.conveyingType]      : chain.conveyingType || Link.PROCESS_TYPE.ADVECTIVE,
                    [$Field.conveyingMaterials] : conveyingMaterials,
                    [$Field.color]              : $Color.Link,
                    [$Field.skipLabel]          : true,
                    [$Field.generated]          : true
                };
                if (chain.length){
                    link.length = chain.length / lyphs.length;
                }
                if (prev){
                    prev.next = link.id;
                }
                prev = link;
                mergeGenResource(chain.group, parentGroup, link, $Field.links);
                chain.levels[i] = link.id;
                link.levelIn = chain.id;
            }
            chain.numLevels = chain.levels.length;
            if (chain.root === undefined) {
                chain.root = nodeIDs[0];
            }
            if (chain.leaf === undefined) {
                chain.leaf = nodeIDs[n];
            }
        }

        function deriveFromLevels(){
            if (chain.housingChain){
                if (chain.housingLyphs){
                    logger.warn($LogMsg.CHAIN_CONFLICT, chain);
                } else {
                    //Retrieve lyphs from housing chain
                    let housingChain = findResourceByID(parentGroup.chains, chain.housingChain);
                    if (!housingChain){
                        logger.warn($LogMsg.CHAIN_NO_HOUSING, chain.id);
                        return;
                    }
                    chain.housingLyphs = housingChain.lyphs || [];
                    if (chain.housingRange){
                        let min = Math.max(chain.housingRange.min, 0);
                        let max = Math.min(chain.housingRange.max, chain.housingLyphs.length);
                        chain.housingLyphs = chain.housingLyphs.slice(min, max);
                        logger.info($LogMsg.CHAIN_SLICE, housingChain.id, chain.housingLyphs.length);
                    }
                }
            }

            chain.numLevels = chain.numLevels || 0;
            if (!chain.numLevels && chain.housingLyphs){
                chain.numLevels = chain.housingLyphs.length;
            }

            chain.levels = chain.levels || new Array(chain.numLevels);

            //Levels should contain link objects for generation/validation
            for (let i = 0; i < chain.levels.length; i++) {
                chain.levels[i] = findResourceByID(parentGroup.links, chain.levels[i]) || {};
            }

            //Match number of requested levels with the levels[i] array length
            if (chain.levels.length !== chain.numLevels){
                let min = Math.min(chain.levels.length, chain.numLevels || 1);
                let max = Math.max(chain.levels.length, chain.numLevels || 0);
                logger.info($LogMsg.CHAIN_NUM_LEVELS, min, max);
                for (let i = min; i < max; i++){
                    chain.levels.push({});
                }
                chain.numLevels = max;
            }
            let N = chain.numLevels;

            let sources = chain.levels.map(l => l? l.source: null);
            let targets = chain.levels.map(l => l? l.target: null);
            sources[0] = sources[0] || chain.root;
            targets[N - 1] = targets[N - 1] || chain.leaf;

            for (let i = 1; i < N; i++){
                if (sources[i] && targets[i-1] && !compareResources(targets[i-1], sources[i])){
                    logger.error($LogMsg.CHAIN_LEVEL_ERROR, i, targets[i-1], sources[i]);
                }
            }

            const getNewNode = i => ({
                    [$Field.id]        : getGenID(chain.id, $Prefix.node, i),
                    [$Field.color]     : $Color.InternalNode,
                    [$Field.val]       : 1,
                    [$Field.skipLabel] : true,
                    [$Field.generated] : true
                });

            for (let i = 0; i < N; i++){
                sources[i] = sources[i] || ((i > 0) && targets[i-1]) || getNewNode(i);
                mergeGenResource(chain.group, parentGroup, sources[i], $Field.nodes);
            }
            for (let i = 1; i < N; i++){
                targets[i-1] = sources[i];
            }
            targets[N - 1] = targets[N - 1] || getNewNode(N);
            mergeGenResource(chain.group, parentGroup, targets[N - 1], $Field.nodes);

            chain.root = getID(sources[0]);
            chain.leaf = getID(targets[N - 1]);
            let lyphTemplate = getLyphTemplate();

            //Create levels
            chain.lyphs = [];
            let prev;
            for (let i = 0; i < N; i++){
                if (!chain.levels[i]){ chain.levels[i] = {}; }
                //Do not override existing properties
                let link = chain.levels[i];
                link::defaults({
                    [$Field.id]        : getGenID(chain.id, $Prefix.link, i+1),
                    [$Field.source]    : getID(sources[i]),
                    [$Field.target]    : getID(targets[i]),
                    [$Field.levelIn]   : chain.id,
                    [$Field.color]     : $Color.Link,
                    [$Field.skipLabel] : true,
                    [$Field.generated] : true
                });
                if (chain.length){
                    link.length = chain.length / N;
                }
                if (prev){
                    prev.next = link.id;
                }
                prev = link;

                if (lyphTemplate && !chain.levels[i].conveyingLyph){
                    //Only create ID, conveying lyphs will be generated and added to the group by the "expandTemplate" method
                    let lyph = {
                        [$Field.id]         : getGenID(chain.id, $Prefix.lyph, i+1),
                        [$Field.supertype]  : chain.lyphTemplate,
                        [$Field.conveys]    : chain.levels[i].id,
                        [$Field.topology]   : getLevelTopology(i, N, lyphTemplate),
                        [$Field.skipLabel]  : true,
                        [$Field.generated]  : true
                    };
                    chain.levels[i].conveyingLyph = lyph.id;
                    mergeGenResource(chain.group, parentGroup, lyph, $Field.lyphs);
                }
                mergeGenResource(chain.group, parentGroup, chain.levels[i].conveyingLyph, $Field.lyphs);
                mergeGenResource(chain.group, parentGroup, chain.levels[i], $Field.links);

                chain.lyphs[i] = chain.levels[i].conveyingLyph;
                chain.levels[i] = chain.levels[i].id; //Replace with ID to avoid resource definition duplication
            }
        }

        if (isDefined(chain.lyphs)){
            if (isDefined(chain.levels)){
                logger.warn($LogMsg.CHAIN_CONFLICT2);
            }
            deriveFromLyphs(parentGroup, chain)
        } else {
            deriveFromLevels(parentGroup, chain);
        }
    }

    /**
     * Align chain levels along housing lyphs
     * @param parentGroup
     * @param chain
     */
    static embedToHousingLyphs(parentGroup, chain) {
        if (!chain || !chain.id || !chain.levels){ return; }
        if (!chain.housingLyphs) {return; }

        const addInternalNode = (lyph, node) => {
            lyph.internalNodes = lyph.internalNodes || [];
            lyph.internalNodes.push(node);
        };

        let N = Math.min(chain.housingLyphs.length, chain.levels.length);
        parentGroup.coalescences = parentGroup.coalescences || [];

        for (let i = 0; i < N; i++) {
            if (!chain.housingLyphs[i]) {return; }
            let housingLyph = findResourceByID(parentGroup.lyphs, chain.housingLyphs[i]);
            if (!housingLyph) {
                logger.warn($LogMsg.CHAIN_NO_HOUSING_LYPH, chain.housingLyphs[i]);
                return;
            }

            let sameAsPrev = i > 0 && chain.housingLyphs[i] === chain.housingLyphs[i-1];
            let sameAsNext = i < N - 1 && chain.housingLyphs[i] === chain.housingLyphs[i+1];
            let sourceInternal = (i === 0);
            let targetInternal = (i === N - 1) || sameAsNext && !sameAsPrev;

            //A chain level can be "hosted" by the lyph, by its outermost layer, or by any other layer that bundles the chain or referred to .
            let hostLyph = housingLyph;
            let bundlingLayer;
            let sourceBorderIndex = 1;
            let targetBorderIndex = 3;
            if (hostLyph.layers){
                let layers = hostLyph.layers.map(layerID => findResourceByID(parentGroup.lyphs, layerID));
                layers = layers.filter(layer => !!layer);
                if (layers.length < hostLyph.layers){
                    logger.warn($LogMsg.CHAIN_NO_HOUSING_LAYERS, hostLyph.layers, hostLyph.id);
                    return;
                }
                bundlingLayer = layers.find(e => (e.bundlesChains||[]).find(t => t === chain.id));
                let index = layers.length - 1;
                if (chain.housingLayers && chain.housingLayers.length > i){
                    if (chain.housingLayers[i] < index){
                        index = Math.max(0, chain.housingLayers[i]);
                        if (bundlingLayer && (bundlingLayer !== layers[index])){
                            logger.warn($LogMsg.CHAIN_CONFLICT3,
                                bundlingLayer.id, layers[index].id);
                        }
                    }
                }
                hostLyph = bundlingLayer || layers[index] || hostLyph;
            }

            let level = findResourceByID(parentGroup.links, chain.levels[i]);

            if (!hostLyph || !level)  {
                logger.warn($LogMsg.CHAIN_NO_HOUSING_LYPH, housingLyph.id, chain.levels[i], level, hostLyph);
                return;
            }

            if (!hostLyph.isTemplate) {
                if (i === 0 || i === (N-1)) {
                    hostLyph.endBundles = hostLyph.endBundles || [];
                    hostLyph.endBundles.push(level.id);
                } else {
                    hostLyph.bundles = hostLyph.bundles || [];
                    hostLyph.bundles.push(level.id);
                }
                hostLyph.border = hostLyph.border || {};
                hostLyph.border.borders = hostLyph.border.borders || [{}, {}, {}, {}];

                if (sameAsNext){
                    sourceBorderIndex = chain.housingLayers[i] > chain.housingLayers[i+1]? 0: 2;
                }
                if (sameAsPrev){
                    targetBorderIndex = chain.housingLayers[i] < chain.housingLayers[i-1]? 2: 0;
                }

                //Start and end nodes
                if (sourceInternal){
                    addInternalNode(hostLyph, level.source);
                } else {
                    addBorderNode(hostLyph.border.borders[targetBorderIndex], level.source);
                }
                if (targetInternal){
                    addInternalNode(hostLyph, level.target);
                } else {
                    let targetNode = findResourceByID(parentGroup.nodes, level.target) || {
                        [$Field.id] : level.target,
                        [$Field.skipLabel] : true,
                        [$Field.generated] : true
                    };
                    let targetClone = Node.clone(targetNode);
                    addBorderNode(hostLyph.border.borders[sourceBorderIndex], targetClone.id);
                    let lnk = Link.createCollapsibleLink(targetNode.id, targetClone.id);
                    level.target = targetClone.id;
                    chain.group.nodes.push(targetClone);
                    chain.group.links.push(lnk);
                }
            } else {
                logger.warn($LogMsg.CHAIN_HOUSING_TEMPLATE, hostLyph);
            }

            //Coalescence is always defined with the main housing lyph
            if (level.conveyingLyph) {
                let lyphCoalescence = {
                    [$Field.id]        : getGenID(housingLyph.id, $Prefix.coalescence, level.conveyingLyph),
                    [$Field.generated] : true,
                    [$Field.topology]  : Coalescence.COALESCENCE_TOPOLOGY.EMBEDDING,
                    [$Field.lyphs]     : [housingLyph.id, level.conveyingLyph]
                };
                parentGroup.coalescences.push(lyphCoalescence);
            } else {
                logger.warn($LogMsg.CHAIN_NO_COALESCENCE, housingLyph.id, level.id);
            }
        }
    }

    /**
     * Resize generated chain lyphs to fit into hosting lyphs (housing lyph or its layer)
     * Optionally, adjust lyph sizes to be the same for the entire chain
     * @param sameWidth - boolean parameter to indicate that all chain lyphs should have the same width
     */
    resizeLyphs(sameWidth = true){
        const MAX_WIDTH = 1000;
        let minWidth = MAX_WIDTH;
        (this.levels||[]).forEach(lnk => {
            let lyph = lnk.conveyingLyph;
            if (!lyph){
                logger.warn($LogMsg.CHAIN_NO_CONVEYING_LYPH, this.id, lnk.id)
                return;
            }
            lyph.updateSize();
            minWidth = Math.min(minWidth, lyph.width);
        });
        if (sameWidth && minWidth < MAX_WIDTH){
            (this.levels||[]).forEach(lnk => lnk.conveyingLyph && (lnk.conveyingLyph.width = minWidth));
        }
    }

    getWiredChainEnds(){
        let start, end;
        if (this.wiredTo) {
            start = this.wiredTo.source;
            end   = this.wiredTo.target;
            if (this.startFromLeaf){
                let tmp = start;
                start = end;
                end = tmp;
            }
        } else {
            start = this.root.anchoredTo? this.root.anchoredTo: this.root.layout;
            end   = this.leaf.anchoredTo? this.leaf.anchoredTo: this.leaf.layout;
        }
        return {start, end};
    }

    validateTopology() {
        const n = (this.levels||[]).length;

        if (n < 1) { return false; }
        if (n === 1) { return true; }

        for (let i = 1; i < n - 1; i++) {
            const lyph = this.levels[i].conveyingLyph;
            if (lyph && (lyph.topology || Lyph.LYPH_TOPOLOGY.TUBE) !== Lyph.LYPH_TOPOLOGY.TUBE) {
                return false;
            }
        }
        const startLyph = this.levels[0].conveyingLyph;
        if (startLyph && [Lyph.LYPH_TOPOLOGY["BAG-"], Lyph.LYPH_TOPOLOGY.BAG, Lyph.LYPH_TOPOLOGY.CYST].includes(startLyph.topology)){
            return false;
        }
        const endLyph = this.levels[n - 1].conveyingLyph;
        if (endLyph && [Lyph.LYPH_TOPOLOGY["BAG+"], Lyph.LYPH_TOPOLOGY.BAG2, Lyph.LYPH_TOPOLOGY.CYST].includes(endLyph.topology)){
            return false;
        }
        return true;
    }
}



