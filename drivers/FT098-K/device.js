'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const zwaveUtils = require('homey-meshdriver').Util;

class OomiLEDBulbDevice extends ZwaveDevice {
	async onMeshInit() {	

		this.registerCapability('onoff', 'BASIC');
		this.registerCapability('dim', 'BASIC');
		//this.printNode();
		//this.enableDebug();

		
		this.registerMultipleCapabilityListener(['light_hue', 'light_saturation', 'light_temperature', 'light_mode'], async (values, options) => {
		    let rgb = {red: 0, green: 0, blue: 0};
            let temp = {cw: 0, ww: 0};

            if (values.light_mode === 'color') {
                if (this.currentRGB) rgb = this.currentRGB;
                else {
                    let hue = this.getCapabilityValue('light_hue'),
                        saturation = this.getCapabilityValue('light_saturation'),
                        dim = this.getCapabilityValue('dim');

                    rgb = zwaveUtils.convertHSVToRGB({hue: hue, saturation: saturation, value: dim});
                    this.currentRGB = rgb;
                }
            } else if (values.light_mode === 'temperature') {
                if (this.currentTemp) temp = this.currentTemp;
                else {
                    this.getCapabilityValue('light_temperature') < .5 ? temp.cw = this._map(0, 0.5, 255, 10, this.getCapabilityValue('light_temperature')) : temp.cw = 0;
                    this.getCapabilityValue('light_temperature') >= .5 ? temp.ww = this._map(0.5, 1, 10, 255, this.getCapabilityValue('light_temperature')) : temp.ww = 0;
                    this.currentTemp = temp;
                }
            } else if (typeof values.light_hue === 'number' || typeof values.light_saturation === 'number') {
                let hue, saturation, dim;
                typeof values.light_hue === 'number' ? hue = values.light_hue : hue = this.getCapabilityValue('light_hue');
                typeof values.light_saturation === 'number' ? saturation = values.light_saturation : saturation = this.getCapabilityValue('light_saturation');
                dim = this.getCapabilityValue('dim');

                rgb = zwaveUtils.convertHSVToRGB({hue: hue, saturation: saturation, value: dim});
                this.currentRGB = rgb;
            } else if (typeof values.light_temperature === 'number') {
                values.light_temperature < .5 ? temp.cw = this._map(0, 0.5, 255, 10, values.light_temperature) : temp.cw = 0;
                values.light_temperature >= .5 ? temp.ww = this._map(0.5, 1, 10, 255, values.light_temperature) : temp.ww = 0;
                this.currentTemp = temp;
            }

            // Send values
            return await this._sendColors({red: rgb.red, green: rgb.green, blue: rgb.blue, warm: temp.ww, cold: temp.cw});
        });

        this.registerSetting("80", (input) => new Buffer([(input) ? 2 : 0]));
        this.registerSetting("34", (input) => new Buffer([(input) ? 1 : 0]));
        this.registerSetting("35", (input) => new Buffer([(input) ? 1 : 0]));
	}

	async rainbowModeHandler(args) {
	    console.log(args);

        if (args && typeof args.speed === 'number' && typeof args.fadeType === 'string' && typeof args.cycles === 'number') {

            // Map speed 100 - 0 to 0 - 254
            args.speed = Math.round(this._map(100, 0, 0, 254, args.speed));

            // Get fadeType as integerapi/manager/zwave/command
            args.fadeType = parseInt(args.fadeType);

            // Round cycles
            args.cycles = Math.round(args.cycles);

            const command = this._createColourCommand(1, args.fadeType, args.cycles, args.speed, 5);

            //Send parameter values to module
            try {
                await this.node.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
                    "Parameter Number": 37,
                    "Level": {
                        "Size": 4,
                        "Default": false
                    },
                    'Configuration Value': command
                });

                await this.setSettings({
                    37: command
                });

                return Promise.resolve(true);
            } catch (e) {
                return Promise.resolve(false);
            }
        } else return Promise.reject('invalid_device');
    }

    _createColourCommand(colourDisplayCycle, colourTransitionStyle, cycleCount, colourChangeSpeed, colourResidenceTime) {
        return new Buffer([this._getDecimalValueFromArrays(colourTransitionStyle, 2, colourDisplayCycle, 4, true), cycleCount, colourChangeSpeed, colourResidenceTime]);
    }

    _getDecimalValueFromArrays(value1, size1, value2, size2, fillPos5And4) {
        if (fillPos5And4) {
            return this._getDecimalValue(this._numberToBinaryArray(value1, size1)
                .concat(['0', '0'].concat(this._numberToBinaryArray(value2, size2))));
        }
        return this._getDecimalValue(this._numberToBinaryArray(value1, size1)
            .concat(this._numberToBinaryArray(value2, size2)));
    }

    _getDecimalValue(arr) {
        if (!arr) return new Error('no array provided');
        let binaryString = '';
        arr.forEach(item => {
            binaryString += item;
        });
        return parseInt(binaryString, 2);
    }

    _numberToBinaryArray(number, size) {
        number = (number).toString(2);
        const numbers = number.split('');

        numbers.forEach(x => {
            x = parseInt(x);
        });

        // Check if array has correct size
        if (numbers.length !== size) {
            for (let i = 0; i < size; i++) {

                // Check if 0 prepend is needed to fill
                if (numbers.length < size) {
                    numbers.unshift('0');
                } else break;
            }
        }
        return numbers;
    }

	_map(inputStart, inputEnd, outputStart, outputEnd, input) {
        return outputStart + ((outputEnd - outputStart) / (inputEnd - inputStart)) * (input - inputStart);
    }

    async _sendColors({red, green, blue, warm, cold}) {
        return await this.node.CommandClass.COMMAND_CLASS_SWITCH_COLOR.SWITCH_COLOR_SET({
            Properties1: {
                'Color Component Count': 5
            },
            vg1: [
                {
                    'Color Component ID': 0,
                    Value: warm
                },
                {
                    'Color Component ID': 1,
                    Value: cold
                },
                {
                    'Color Component ID': 2,
                    Value: red
                },
                {
                    'Color Component ID': 3,
                    Value: green
                },
                {
                    'Color Component ID': 4,
                    Value: blue
                },
            ]
        });
    }

    getApi() {

        if (!this.api) {
            this.api = HomeyAPI.forCurrentHomey();
        }
        return this.api;
    }	
	
}






module.exports = OomiLEDBulbDevice;
