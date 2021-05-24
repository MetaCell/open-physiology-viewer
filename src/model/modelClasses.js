import {GroupTemplate} from './groupTemplateModel';
import {Chain}   from './chainModel';
import {Tree}    from './treeModel';
import {Channel} from './channelModel';
import {Villus}  from './villusModel';
import {Group}   from './groupModel';
import {Component} from './componentModel';
import {Graph}   from './graphModel';
import {Scaffold} from './scaffoldModel';
import {Resource, External} from './resourceModel';
import {VisualResource, Material} from './visualResourceModel';
import {Vertice, Anchor, Node} from './verticeModel';
import {Edge, Wire, Link} from './edgeModel';
import {Shape, Lyph, Region, Border} from './shapeModel'
import {Coalescence}  from './coalescenceModel';
import {$Field, $SchemaClass} from './utils';
import {isString, isObject, isArray, isNumber, isEmpty, keys, merge, assign} from "lodash-bound";
import * as schema from "./graphScheme";

import * as XLSX from 'xlsx';

import * as jsonld from "jsonld/dist/node6/lib/jsonld";

import {
    getNewID,
    getFullID,
    getClassName
} from "./utils";

export const modelClasses = {
    /*Abstract */
    [$SchemaClass.Resource]       : Resource,
    [$SchemaClass.VisualResource] : VisualResource,
    [$SchemaClass.GroupTemplate]  : GroupTemplate,
    [$SchemaClass.Shape]          : Shape,
    [$SchemaClass.Edge]           : Edge,
    [$SchemaClass.Vertice]        : Vertice,

    /*Resources */
    [$SchemaClass.External]      : External,
    [$SchemaClass.Coalescence]   : Coalescence,
    [$SchemaClass.Channel]       : Channel,
    [$SchemaClass.Chain]         : Chain,
    [$SchemaClass.Tree]          : Tree,
    [$SchemaClass.Villus]        : Villus,
    [$SchemaClass.Group]         : Group,
    [$SchemaClass.Graph]         : Graph,
    [$SchemaClass.Component]     : Component,
    [$SchemaClass.Scaffold]      : Scaffold,

    /*Visual resources */
    [$SchemaClass.Anchor]        : Anchor,
    [$SchemaClass.Wire]          : Wire,
    [$SchemaClass.Node]          : Node,
    [$SchemaClass.Link]          : Link,

    /* Shapes */
    [$SchemaClass.Material]      : Material,
    [$SchemaClass.Region]        : Region,
    [$SchemaClass.Lyph]          : Lyph,
    [$SchemaClass.Border]        : Border
};

/**
 * Parses input specification in XLSX (Excel file) or JSON format
 * @param content   - input model content
 * @param name      - file name
 * @param extension - file extension
 * @param isBinary  - Boolean flag that indicates whether the input model is in binary format
 */
export function loadModel(content, name, extension, isBinary = true){
    let newModel = {};
    if (extension === "xlsx"){
        let excelModel = {};
        let wb = isBinary? XLSX.read(content, {type: "binary"}): content;
        wb.SheetNames.forEach(sheetName => {
            let roa = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {header:1});
            if(roa.length) { excelModel[sheetName] = roa; }
        });
        excelModel[$Field.id] = excelModel[$Field.id] || name;
        newModel = excelToJSON(excelModel);
    } else {
        if (extension === "json") {
            if (content::isString()){
                newModel = JSON.parse(content);
            } else {
                newModel = content;
            }
        }
    }
    newModel[$Field.name] = newModel[$Field.name] || name;
    return newModel;
}

/**
 * Determines whether the given JSON specification defines a scaffold
 * @param inputModel
 * @returns {boolean}
 */
export function isScaffold(inputModel){
    return !!(inputModel.components || inputModel.anchors || inputModel.wires);
}

/**
 * Convert model from Excel template to JSON input specification
 * @param inputModel - Excel input specification of connectivity model or scaffold
 * @returns {*}
 */
export function excelToJSON(inputModel) {
    if (isScaffold(inputModel)){
       return Scaffold.excelToJSON(inputModel, modelClasses);
    } else {
       return Graph.excelToJSON(inputModel, modelClasses);
    }
}

/**
 * Create complete typed model from JSON input specification
 * @param inputModel - JSON input specification of connectivity model or scaffold
 * @returns {Graph}
 */
export function fromJSON(inputModel) {
    if (isScaffold(inputModel)){
        return Scaffold.fromJSON(inputModel, modelClasses);
    } else {
        return Graph.fromJSON(inputModel, modelClasses);
    }
}

/**
 * 
 * @param {*} inputModelA 
 * @param {*} inputModelB 
 * @param {*} flattenGroups 
 * @returns 
 */
export function fromJSONGenerated(inputModel) {
    let namespace = inputModel.namespace;
    let entitiesByID = {
        waitingList: {}
    };

    const skip = value => !value || value::isObject() && value::isEmpty() || value.class && (value instanceof modelClasses[value.class]);

    function typeCast(obj) {
        if (!skip(obj)) {
            let fullResID = getFullID(namespace, obj.id);
            entitiesByID[fullResID] = obj;
        }
        if (obj instanceof Object && !(obj instanceof Array) && !(typeof obj === 'function') && obj['class'] !== undefined && modelClasses[obj['class']] !== undefined) {
            const cls = modelClasses[obj['class']];
            const res = new cls(obj.id);
            res.class = obj['class'];
            res::assign(obj);
            return res;
        } else {
            return obj
        }
    }

    function iterateObj(obj) {
        obj = typeCast(obj)

        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                for (let i = 0; i < obj[key].length; i++) {
                    obj[key][i] = iterateObj(obj[key][i]);
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                obj[key] = iterateObj(obj[key]);
            }
        }
        return obj;
    }

    var _classed_model = iterateObj(inputModel);
    _classed_model.entitiesByID = entitiesByID;

return _classed_model;
}

/**
 * Join two input models. Models can be joint:
 *  (1) by placing model B into model A,
 *  (2) by creating a new model where A and B are groups/components,
 *  (3) by placing scaffold into model, model types are defined automatically based on schema
 * @param inputModelA - first input model
 * @param inputModelB - second input model
 * @param flattenGroups - Boolean flag that indicates whether model B should be joined to model A as its group
 * @returns {*}
 */
export function joinModels(inputModelA, inputModelB, flattenGroups = false){
    if (isScaffold(inputModelA)){
        if (isScaffold(inputModelB)) {
            //Both specifications define scaffolds
            schema.definitions.Scaffold.properties::keys().forEach(property => {
                delete inputModelB[property];
                delete inputModelA[property];
            });
            if (flattenGroups){
                inputModelA.components = inputModelA.components || [];
                inputModelA.components.push(inputModelB);
                return inputModelA;
            }
            return {[$Field.components]: [inputModelA, inputModelB]};
        } else {
            //Connectivity model B gets constrained by scaffold A
            inputModelB.scaffolds = inputModelB.scaffolds || [];
            inputModelB.scaffolds.push(inputModelA);
            return inputModelB;
        }
    } else {
        //Connectivity model A gets constrained by scaffold B
        if (isScaffold(inputModelB)) {
            inputModelA.scaffolds = inputModelA.scaffolds || [];
            inputModelA.scaffolds.push(inputModelB);
            return inputModelA;
        }
    }
    //Both specifications define connectivity models
    let newConfig = (inputModelA.config||{})::merge(inputModelB.config);
    schema.definitions.Graph.properties::keys().forEach(property => {
        delete inputModelB[property];
        delete inputModelA[property];
    });
    if (flattenGroups) {
        inputModelA.groups = inputModelA.groups || [];
        inputModelA.groups.push(inputModelB);
    }
    return {[$Field.groups]: [inputModelA, inputModelB], [$Field.config]: newConfig};
}
