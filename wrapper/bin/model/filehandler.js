const fs = require('fs');
const axios = require("axios");
const converter = require('../../../dist/converter');
const conversionSteps = [
    "id",
    "xlsx",
    "json",
    "json-resources",
    "json-ld",
];


class ConversionHandler {
    _date = new Date();
    _destination_folder = "converted-"+ this._date.toISOString().replace('T', '_').replace(/:|\./g, '-');
    constructor(step, input) {
        if (step === undefined || input === undefined) {
            throw new Error('The input has not been provided.');
        }

        if (!fs.existsSync(this._destination_folder)) {
            fs.mkdirSync(this._destination_folder);
        }
        this.step = step;
        this.input = input;
        this.result = this.input;
    }

    _conversion_methods = {
        "id": async (input) => {
            return this.#fromIdToXlsx(input)
        },
        "xlsx": (input) => {
            return this.#fromXlsxToJson(input)
        },
        "json": (input) => {
            return this.#fromJsonToGenerated(input)
        },
        "json-resources": (input) => {
            return this.#fromGeneratedToLD(input)
        },
        "json-ld": async (input) => {
            return this.#fromLDToFlattened(input)
        }
    };

    sleep(ms) {
        // special Reserved IPv4 Address(RFC 5736): 192.0.0.0
        // refer: https://en.wikipedia.org/wiki/Reserved_IP_addresses
        execSync(`start /b ping 192.0.0.0 -n 1 -w ${ms} > nul`)
    }

    async #fromIdToXlsx(id) {
        var that = this;
        const url = "https://docs.google.com/spreadsheets/d/" + id + "/export?format=xlsx";
        return await axios.get(
            url,
            {
                headers: {
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }}).then(res => {
            let _filename = that._destination_folder + "/" + res.headers['content-disposition'].match(/filename=".*"/g)[0].replace(/filename=\"|\"/g, '');
            fs.writeFileSync(_filename, res.data);
            return _filename;
        });
    }

    #fromXlsxToJson(file) {
        try {
            if (fs.existsSync(file)) {
                let filename = this._destination_folder + "/model.json";
                let _xlsx = fs.readFileSync(file, 'binary');
                let _json_model = converter.fromXLSXToJson(_xlsx);
                fs.writeFileSync(filename, _json_model);
                return filename;
            } else {
                throw new Error('The file given in input does not exist or is not located where specified.')
            }
        } catch(err) {
            throw new Error('An error has been encoutered during the conversion from XLSX to Json.')
        }
    }

    #fromJsonToGenerated(file) {
        try {
            if (fs.existsSync(file)) {
                let filename = this._destination_folder + "/model-generated.json";
                let _json = fs.readFileSync(file, 'binary');
                let _generated = converter.fromJsonToGenerated(_json);
                fs.writeFileSync(filename, _generated);
                return filename;
            } else {
                throw new Error('The file given in input does not exist or is not located where specified.')
            }
        } catch(err) {
            throw new Error('An error has been encoutered during the conversion from XLSX to Json.')
        }
    }

    #fromGeneratedToLD(file) {
        try {
            if (fs.existsSync(file)) {
                let filename = this._destination_folder + "/model.jsonLD";
                let _generated = fs.readFileSync(file, 'binary');
                let result = converter.fromGeneratedToJsonLD(_generated);
                fs.writeFileSync(filename, result);
                return filename;
            } else {
                throw new Error('The file given in input does not exist or is not located where specified.')
            }
        } catch(err) {
            throw new Error('An error has been encoutered during the conversion from XLSX to Json.')
        }
    }

    #fromLDToFlattened(file) {
        try {
            if (fs.existsSync(file)) {
                var filename = this._destination_folder + "/model-flattened.jsonLD";
                var _jsonld = fs.readFileSync(file, 'binary');
                const _callback = function callback(res) {
                    let _flattened = JSON.stringify(res, null, 2);
                    fs.writeFileSync(filename, _flattened);
                    return filename;
                };
                converter.fromJsonLDToFlattened(_jsonld, _callback);
            } else {
                throw new Error('The file given in input does not exist or is not located where specified.')
            }
        } catch(err) {
            throw new Error('An error has been encoutered during the conversion from XLSX to Json.')
        }
    }

    async convertAll() {
        var startConverting = false;
        for (const step of conversionSteps) {
            if (step === this.step || startConverting) {
                startConverting = true;
                this.result = await this._conversion_methods[step](this.result);
            }
        }
    }
}

module.exports = ConversionHandler
