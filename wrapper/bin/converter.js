#!/usr/bin/env node

global.self = {};
global.window = {};

const fs = require('fs');
const util = require("util");
const axios = require("axios");
const yargs = require("yargs");
const converter = require('../../dist/converter');
const ConversionHandler = require('./model/filehandler');

const options = yargs
 .usage("Usage: ")
 .option("i", { alias: "input", describe: "Input data to convert", type: "string", demandOption: true})
 .option("m", { alias: "method", describe: "From which step of the conversion we are starting", type: "string", choices: [ "id", "xlsx", "json", "json-resources", "json-ld" ], demandOption: true})
 .argv;

// to_convert = new ConversionHandler(options.m, options.i);
// to_convert.convertAll();

let _path = options.i
readTextFile(_path)




function readTextFile(file)
{
    let _xlsx = fs.readFileSync(file, 'binary');
    let results1 = converter.fromXLSXToJson(_xlsx);
    fs.writeFileSync("model.json", results1);

    let _json = fs.readFileSync("model.json", 'binary');
    let results2 = converter.fromJsonToGenerated(_json);
    fs.writeFileSync("model-generated.json", results2);

    let _jsonLD = converter.convertToJsonLD(_xlsx, ".xlsx", "xlsx");
    fs.writeFileSync("model2.jsonLD", _jsonLD);

    let _generated = fs.readFileSync("model-generated.json", 'binary');
    let results3 = converter.fromGeneratedToJsonLD(_generated);
    fs.writeFileSync("model.jsonLD", results3);

    // const _callback = function callback(res) {
    //     let _flattened = JSON.stringify(res, null, 2);
    //     fs.writeFileSync("model-flattened.jsonLD", _flattened);
    // };

    // let _jsonLD2 = fs.readFileSync("model.jsonLD", 'binary');
    // let results4 = converter.fromJsonLDToFlattened(_jsonLD2, _callback);
    // fs.writeFileSync("model-flattened.jsonLD", results4);



    // fs.readFile(file, 'binary', function(err, data) {
    //     if (err) throw err;
    //     _json = converter.convertToJson(data, ".xlsx", "xlsx")
    //     fs.writeFileSync("model.json", _json);

    //     _generated = converter.convertToJsonGenerated(data, ".xlsx", "xlsx");
    //     fs.writeFileSync("model-generated.json", _generated);

    //     _jsonLD = converter.convertToJsonLD(data, ".xlsx", "xlsx");
    //     fs.writeFileSync("model.jsonLD", _jsonLD);

    //     const _callback = function callback(res) {
    //         let _flattened = JSON.stringify(res, null, 2);
    //         fs.writeFileSync("model-flattened.jsonLD", _flattened);
    //     };
    //     // converter.convertToJsonLDFlattened(data, ".xlsx", "xlsx", _callback);
    //     converter.convertToJsonLDFlattened2(fs.readFileSync("model-generated.json", 'binary'), _callback);
    // });
}
