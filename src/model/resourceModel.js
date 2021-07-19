import * as colorSchemes from 'd3-scale-chromatic';
import {
    isArray,
    merge,
    isObject,
    isNumber,
    isString,
    keys,
    isEmpty,
    assign,
    defaults,
    pick,
    difference
} from 'lodash-bound';

import JSONPath from 'JSONPath';
import {
    schemaClassModels,
    $Field,
    $SchemaType,
    isClassAbstract,
    getClassName,
    getNewID,
    getFullID, $SchemaClass
} from "./utils";
import {logger, $LogMsg} from './logger';

/**
 * The class defining common methods for all resources
 * @class
 * @property {string} id
 * @property {string} name
 * @property {string} class
 * @property {Boolean} generated
 * @property {Object} infoFields
 * @property {Object} JSON
 * @property {Array<Object>} assign
 * @property {Array<Object>} interpolate
 * @property {Object} generatedFrom
 */
export class Resource{
    constructor(id, clsName) {
        this::merge(schemaClassModels[clsName].defaultValues);
        this.id = id;
        this.class = clsName;
    }

    /**
     * Creates a Resource object from its JSON specification
     * @param   {Object} json                          - resource definition
     * @param   {Object} [modelClasses]                - map of class names vs implementation of ApiNATOMY resources
     * @param   {Map<string, Resource>} [entitiesByID] - map of resources in the global model
     * @param   {string} namespace
     * @returns {Resource} - ApiNATOMY resource
     */
    static fromJSON(json, modelClasses = {}, entitiesByID, namespace){

        let clsName = json.class;
        const cls = modelClasses[clsName] || this;
        const res = new cls(json.id, clsName);

        //spec
        let difference = json::keys().filter(x => !schemaClassModels[clsName].fieldNames.find(y => y === x)).filter(x => !["_inactive"].includes(x));
        if (difference.length > 0) {
            logger.warn($LogMsg.RESOURCE_IGNORE_FIELDS, this.name, difference.join(","));
        }

        res::assign(json);

        if (entitiesByID){
            if (!res.id) { res.id = getNewID(entitiesByID); }
            if (res.id::isNumber()){
                res.id = res.id.toString();
                logger.warn($LogMsg.RESOURCE_NUM_ID_TO_STR, res.id);
            }

            let fullResID = getFullID(namespace, res.id);
            if (entitiesByID[fullResID]) {
                if (entitiesByID[fullResID] !== res){
                    logger.warn($LogMsg.RESOURCE_NOT_UNIQUE, entitiesByID[fullResID], res);
                }
            } else {
                entitiesByID[fullResID] = res;
                res.reviseWaitingList(entitiesByID.waitingList, namespace);
                res.replaceIDs(modelClasses, entitiesByID, namespace);
            }
        }
        return res;
    }

    static createResource(id, clsName, group, modelClasses, entitiesByID, namespace){
        let e = modelClasses[clsName].fromJSON({
            [$Field.id]        : id,
            [$Field.generated] : true
        }, modelClasses, entitiesByID, namespace);

        //Do not show labels for generated visual resources
        if (e.prototype instanceof modelClasses.VisualResource){
            e.skipLabel = true;
        }

        //Include newly created entity to the main graph
        let prop = schemaClassModels[$SchemaClass.Group].selectedRelNames(clsName)[0];
        if (prop) {
            group[prop] = group[prop] ||[];
            group[prop].push(e);
        }
        let fullID = getFullID(namespace, e.id);
        entitiesByID[fullID] = e;
        return e;
    }

    /**
     * Replace IDs with object references
     * @param {Object} modelClasses - map of class names vs implementation of ApiNATOMY resources
     * @param {Map<string, Resource>} entitiesByID - map of resources in the global model
     * @param {String} namespace - namespace for resource definition
     */
    replaceIDs(modelClasses, entitiesByID, namespace){
        const skip = value => !value || value::isObject() && value::isEmpty() || value.class && (value instanceof modelClasses[value.class]);

        const createObj = (res, key, value, spec) => {
            if (skip(value)) { return value; }

            let fullResID = getFullID(namespace, res.id);
            if (value::isNumber()) {
                value = value.toString();
                logger.warn($LogMsg.RESOURCE_NUM_VAL_TO_STR, value, fullResID, key);
            }

            let clsName = getClassName(spec);
            if (!clsName){
                logger.warn($LogMsg.RESOURCE_NO_CLASS,
                    spec, value);
                return value;
            }

            if (value && value::isString()) {
                let fullValueID = getFullID(namespace, value);
                if (!entitiesByID[fullValueID]) {
                    //put to a wait list instead
                    entitiesByID.waitingList[value] = entitiesByID.waitingList[value] || [];
                    entitiesByID.waitingList[value].push([res, key]);
                    return value;
                } else {
                    return entitiesByID[fullValueID];
                }
            }

            if (value.id) {
                let fullValueID = getFullID(namespace, value.id);
                if (entitiesByID[fullValueID]) {
                    if (value !== entitiesByID[fullValueID]) {
                        logger.warn($LogMsg.RESOURCE_DUPLICATE, fullResID, key, value, entitiesByID[fullValueID]);
                    }
                    return entitiesByID[fullValueID];
                }
            }

            //value is an object and it is not in the map
            if (isClassAbstract(clsName)){
                if (value.class) {
                    clsName = value.class;
                    if (!modelClasses[clsName]){
                        logger.error($LogMsg.RESOURCE_NO_CLASS_DEF, value.class, value);
                    }
                } else {
                    logger.error($LogMsg.RESOURCE_NO_ABSTRACT_CLASS, value);
                    return null;
                }
            }
            return modelClasses[clsName].fromJSON(value, modelClasses, entitiesByID, namespace);
        };

        if (!modelClasses[this.class]){
            logger.error($LogMsg.RESOURCE_NO_CLASS_DEF, modelClasses, this.class);
            return;
        }

        let refFields = schemaClassModels[this.class].relationships;
        let res = this;
        refFields.forEach(([key, spec]) => {
            if (skip(res[key])) { return; }
            if (res[key]::isArray()){
                res[key] = res[key].map(value => createObj(res, key, value, spec));
            } else {
                res[key] = createObj(res, key, res[key], spec);
                if (spec.type === $SchemaType.ARRAY){ //The spec expects multiple values, replace an object with an array of objects
                    res[key] = [res[key]];
                }
            }
        });
    };

    /**
     * Create relationships defined with the help of JSONPath expressions in the resource 'assign' statements
     * @param {Object} modelClasses - map of class names vs implementation of ApiNATOMY resources
     * @param {Map<string, Resource>} entitiesByID - map of resources in the global model
     * @param {String} namespace - namespace for resource definition
     */
    assignPathRelationships(modelClasses, entitiesByID, namespace){
        if (!this.assign){ return;  }
        //Filter the value to assign only valid class properties
        try{
            [...(this.assign||[])].forEach(({path, value}) => {
                if (!path || !value) { return;}
                //TODO - fix me: we may need to call JSONPath asynchronously and race with the timer as JSONPath may get stuck
                let entities = (JSONPath({json: this, path: path}) || []).filter(e => !!e);
                entities.forEach(e => {
                    if (!modelClasses[e.class]){
                        logger.warn($LogMsg.RESOURCE_CLASS_UNKNOWN, e);
                    } else {
                        let relNames = schemaClassModels[e.class].relationshipNames;
                        let relMaps  = schemaClassModels[e.class].relationshipMap;
                        let newValue = value::pick(relNames);
                        newValue::keys().forEach(key => {
                            if (relMaps[key]) {
                                if (newValue[key]::isArray()) {
                                    newValue[key] = newValue[key].map(id => entitiesByID[getFullID(namespace,id)])
                                } else {
                                    newValue[key] = entitiesByID[getFullID(namespace, newValue[key])];
                                }
                                logger.info($LogMsg.RESOURCE_JSON_PATH, key, e.id);
                            }
                        });
                        e::merge(newValue);
                        newValue::keys().forEach(key => {
                            if (relMaps[key]) {
                                e.syncRelationship(key, relMaps[key], modelClasses);
                            }
                        });
                    }
                });
            })
        } catch (err){
            logger.error($LogMsg.RESOURCE_JSON_PATH_ERROR, this.id, this.assign);
        }
    };

    /**
     * Assign properties to the objects specified with the help of JSON path expressions in the resource 'assign' statements
     * @param {Object} modelClasses - map of class names vs implementation of ApiNATOMY resources
     */
    assignPathProperties(modelClasses){
        if (!this.assign){ return;  }
        //Filter the value to assign only valid class properties
        try{
            [...(this.assign||[])].forEach(({path, value}) => {
                if (!path || !value) { return;}
                let entities = (JSONPath({json: this, path: path}) || []).filter(e => !!e);
                entities.forEach(e => {
                    if (!modelClasses[e.class]){
                        logger.warn($LogMsg.RESOURCE_CLASS_UNKNOWN, e);
                    } else {
                        let propNames = schemaClassModels[e.class].propertyNames.filter(e => e !== $Field.id);
                        e::merge(value::pick(propNames));
                    }
               });
            })
        } catch (err){
            logger.error($LogMsg.RESOURCE_JSON_PATH_ERROR, this.id, this.assign);
        }
    };

    /**
     * Assign properties to resources specified with the help of JSON path expressions in the resource 'interpolate'
     * statements
     */
    interpolatePathProperties(){
        [...(this.interpolate||[])].forEach(({path, offset, color}) => {

            let resources = path? JSONPath({json: this, path: path}) || []: [];
            if (offset){
                offset::defaults({
                    "start": 0,
                    "end"  : 1,
                    "step" : (offset.end - offset.start) / (resources.length + 1)
                });
                resources.forEach((e, i) => e.offset = offset.start + offset.step * ( i + 1 ) );
            }
            if (color){
                let {scheme, length, reversed = false, offset} = color;
                if (!colorSchemes[scheme]) {
                    logger.warn($LogMsg.RESOURCE_COLOR_UNKNOWN, scheme);
                    return;
                }
                if (!length) { length = resources.length; }
                if (!offset) { offset = 0; }

                const getColor = i => colorSchemes[scheme](((reversed)? 1 - offset - i / length : offset + i / length));
                const assignColor = items => {
                    (items||[]).forEach((item, i) => {
                        if (!item::isObject()) {
                            logger.warn($LogMsg.RESOURCE_COLOR_NO_OBJECT);
                            return;
                        }
                        //If entity is an array, the schema is applied to each of it's items
                        if (item::isArray()){
                            assignColor(item);
                        } else {
                            item.color = getColor(i);
                        }
                    });
                };
                assignColor(resources);
            }
        })
    }

    /**
     * Waiting list keeps objects that refer to unresolved model resources.
     * When a new resource definition is found or created, all resources that referenced this resource by ID get the
     * corresponding object reference instead
     * @param {Map<string, Array<Resource>>} waitingList - associative array that maps unresolved IDs to the list of resource definitions that refer to it
     * @param namespace
     */
    reviseWaitingList(waitingList, namespace){
        let res = this;
        (waitingList[res.id]||[]).forEach(([obj, key]) => {
            if (obj[key]::isArray()){
                obj[key].forEach((e, i) => {
                    if (e === res.id){
                       obj[key][i] = res;
                    }
                });
            } else {
                if (obj[key] === res.id){
                    obj[key] = res;
                }
            }
        });
        delete waitingList[res.id];
    }

    /**
     * Synchronize a relationship field of the resource with its counterpart (auto-fill a field that is involved into a bi-directional relationship based on its partial definition, i.e., A.child = B yields B.parent = A).
     * @param {string} key    - property field that points to the related resource
     * @param {{relatedTo: String}} spec   - JSON schema specification of the relationship field
     * @param {Object} modelClasses -  map of class names vs implementation of ApiNATOMY resources
     *
     */
    syncRelationship(key, spec, modelClasses){
        let res = this;
        let key2 = spec.relatedTo;
        if (key2) {
            let otherClassName = getClassName(spec);
            if (!otherClassName) {
                logger.error($LogMsg.RESOURCE_NO_REL_CLASS, spec);
                return;
            }

            let otherSpec = schemaClassModels[otherClassName].relationshipMap[key2];
            if (!otherSpec) {
                logger.error($LogMsg.RESOURCE_NO_REL_PROPERTY, key2, otherClassName);
                return;
            }

            const syncProperty = (obj) => {
                if (!obj || !obj::isObject()) { return; }
                if (otherSpec.type === $SchemaType.ARRAY) {
                    if (!obj[key2]) { obj[key2] = []; }
                    if (!(obj[key2]::isArray())) {
                        logger.warn($LogMsg.RESOURCE_ARRAY_EXPECTED, key2, obj, typeof(obj));
                        obj[key2] = [obj[key2]];
                    }
                    if (!obj[key2].find(obj2 => obj2 === res)) {
                        obj[key2].push(res);
                    }
                } else {
                    if (!obj[key2]) {
                        obj[key2] = res;
                    }
                    else {
                        if (obj[key2] !== res) {
                            logger.warn($LogMsg.RESOURCE_DOUBLE_REF, obj.id, key2, obj[key2].id, res.id);
                        }
                    }
                }
            };

            if (res[key]::isArray()) {
                res[key].forEach(obj => syncProperty(obj))
            } else {
                syncProperty(res[key]);
            }
        }
    }

    /**
     * Synchronize all relationship properties of the resource
     * @param {Object} modelClasses - map of class names vs implementation of ApiNATOMY resources
     * @param {Map<string, Resource>} entitiesByID - map of resources in the global model
     * @param namespace
     */
    syncRelationships(modelClasses, entitiesByID, namespace){
        entitiesByID::keys().forEach(entityID => {
             if (!entitiesByID[entityID].class){ return; }
             let refFields = schemaClassModels[entitiesByID[entityID].class].relationships;
             (refFields || []).forEach(([key, spec]) => {
                 if (!entitiesByID[entityID][key]) { return; }
                 entitiesByID[entityID].syncRelationship(key, spec, modelClasses);
             });
        });

        entitiesByID::keys().forEach(entityID => {
            if (!entitiesByID[entityID].class){ return; }
            entitiesByID[entityID].assignPathRelationships(modelClasses, entitiesByID, namespace);
        });

        //Assign visual properties to a complete map
        entitiesByID::keys().forEach(entityID => {
            if (!entitiesByID[entityID].class){ return; }
            entitiesByID[entityID].assignPathProperties(modelClasses);
            entitiesByID[entityID].interpolatePathProperties();
        });
    }

    /**
     * Prepare a circular resource object to be serialized in JSON.
     * @param depth - number of nested objects that are exported in full, helps to output resources with recursive dependencies
     * @param inlineResources - a set of properties that refer to inline resources that should not be replaced with their identifiers
     * @returns JSON object with serializable properties of current the resource
     */
    toJSON(depth = 1, inlineResources = {}){
        /**
         * Converts a resource object into serializable JSON.
         * May fail to serialize recursive objects which are not instances of Resource
         * @param value - resource object
         * @param depth - depth of nested resources to output
         * @returns {*} JSON object without circular references         *
         */
        function valueToJSON(value, depth) { return (value instanceof Resource)? value.toJSON(depth-1, inlineResources): value }

        /**
         * Serializes field value: array or object
         * @param value - resource field value
         * @param depth - depth of nested resources to output
         * @returns {*} JSON object or an array of JSON objects without circular references
         */
        function fieldToJSON(value, depth) { return value::isArray()? value.filter(e => !!e).map(e => valueToJSON(e, depth)): valueToJSON(value, depth); }

        if (depth <= 0) {
            return this.id? this.id: null;
        }

        let res = {};
        const omitKeys = (this::keys())::difference(schemaClassModels[this.class].fieldNames).concat([$Field.viewObjects, $Field.infoFields, $Field.labels]);
        this::keys().filter(key => !!this[key] && !omitKeys.includes(key)).forEach(key => {
            res[key] = fieldToJSON(this[key], (inlineResources[key] || depth) - 1);
        });
        return res;
    }

    isGeneratedFrom(id){
        return (this.id === id || this.generatedFrom && this.generatedFrom.id === id);
    }

    /**
     * Checks if the current resource is derived from a given resource
     * @param supertypeID
     * @returns {boolean}
     */
    isSubtypeOf(supertypeID){
        return false;
    }

    /**
     * Checks if the current resource carries a material.
     * @param materialID
     * @returns {*|void}
     */
    containsMaterial(materialID){
        return false;
    }

    /**
     * A stub to make sure call for includeRelated on misclassified resource does not cause exception
     * @param group
     */
    includeRelated(group){
        logger.error($LogMsg.CLASS_ERROR_RESOURCE, "includeRelated", this.id, this.class);
    }


}

export class External extends Resource {
    static fromJSON(json, modelClasses = {}, entitiesByID, namespace) {
          json.class = json.class || $SchemaClass.External;
          return super.fromJSON(json, modelClasses, entitiesByID, namespace);
    }
}