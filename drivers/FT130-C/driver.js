'use strict';

const Homey = require('homey');

class FT130Driver extends Homey.Driver {
    onInit() {
        super.onInit();

        this.batteryTrigger = new Homey.FlowCardTriggerDevice('ft130_battery_full').register();
        this.sceneTrigger = new Homey.FlowCardTriggerDevice('ft130_scene').register().registerRunListener((args, state) => {
            return args.device.sceneRunListener(args, state);
        });
        this.dimTrigger = new Homey.FlowCardTriggerDevice('ft130_dim').register().registerRunListener((args, state) => {
            return args.device.dimRunListener(args, state);
        });
    }
}

module.exports = FT130Driver;
