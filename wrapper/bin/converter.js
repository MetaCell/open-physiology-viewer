#!/usr/bin/env node

const yargs = require("yargs");
const ConversionHandler = require('./model/filehandler');

const options = yargs
 .usage("Usage: ")
 .option("i", { alias: "input", describe: "Input data to convert", type: "string", demandOption: true})
 .option("m", { alias: "method", describe: "From which step of the conversion we are starting", type: "string", choices: [ "id", "xlsx", "json", "json-resources", "json-ld" ], demandOption: true})
 .argv;

to_convert = new ConversionHandler(options.m, options.i);
to_convert.convertAll();
