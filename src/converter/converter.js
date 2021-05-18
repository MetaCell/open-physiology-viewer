import {$Field} from "../model/utils";
import {Graph}   from '../model/graphModel';
import {Scaffold} from '../model/scaffoldModel';
import {loadModel, fromJSON, isScaffold} from '../model/modelClasses';


// Mirroring what the UI does, this part will be removed for the PR, it is intended just to study the code and model

function convertToJson(content, name, extension, isBinary = true){
    let model = loadModel(content, name, extension);
    let _json_model = JSON.stringify(model, null, 4);
    return _json_model;
}

function convertToJsonGenerated(content, name, extension, isBinary = true){
    let model = loadModel(content, name, extension);
    let graphData = fromJSON(model);
    let result = JSON.stringify(graphData.toJSON(3, {
        [$Field.border]   : 3,
        [$Field.borders]  : 3,
        [$Field.villus]   : 3,
        [$Field.scaffolds]: 5
    }), null, 2);
    return result;
}

function convertToJsonLD(content, name, extension, isBinary = true){
    let model = loadModel(content, name, extension);
    let graphData = fromJSON(model);
    let result = JSON.stringify(graphData.entitiesToJSONLD(), null, 2);
    return result;
}

function convertToJsonLDFlattened(content, name, extension, callback, isBinary = true){
    // let model = loadModel(content, name, extension);
    let graphData = fromJSON(model);
    return graphData.entitiesToJSONLDFlat(callback);
}

function convertToJsonLDFlattened2(model, _callback){
    // let model = loadModel(content, name, extension);
    let graphData = fromJSON(model);
    return graphData.entitiesToJSONLDFlat(_callback);
}

// ####  remove end here  #####


function fromXLSXToJson(data) {
    let model = loadModel(data, ".xlsx", "xlsx");
    let _json_model = JSON.stringify(model, null, 4);
    return _json_model;
}

function fromJsonToGenerated(data) {
    let graphData = fromJSON(JSON.parse(data));
    let result = JSON.stringify(graphData.toJSON(3, {
        [$Field.border]   : 3,
        [$Field.borders]  : 3,
        [$Field.villus]   : 3,
        [$Field.scaffolds]: 5
    }), null, 2);
    return result;
}

function fromGeneratedToJsonLD(data) {
    let _generated = JSON.parse(data);
    let _graph_scaffold = null;
    if (isScaffold(_generated)) {
        _graph_scaffold = Object.assign(Scaffold.prototype, _generated);
    } else {
        _graph_scaffold = Object.assign(Graph.prototype, _generated);
    }
    let result = JSON.stringify(_graph_scaffold.entitiesToJSONLD(), null, 2);
    return result;
}

function fromJsonLDToFlattened(data) {
    console.log("to be finished");
}




exports.fromXLSXToJson = fromXLSXToJson;
exports.fromJsonToGenerated = fromJsonToGenerated;
exports.fromGeneratedToJsonLD = fromGeneratedToJsonLD;
exports.fromJsonLDToFlattened = fromJsonLDToFlattened;

exports.convertToJson = convertToJson;
exports.convertToJsonLD = convertToJsonLD;
exports.convertToJsonGenerated = convertToJsonGenerated;
exports.convertToJsonLDFlattened = convertToJsonLDFlattened;
exports.convertToJsonLDFlattened2 = convertToJsonLDFlattened2;
