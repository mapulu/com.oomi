'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class FT111C extends ZwaveDevice {
	
	onMeshInit() {
        this.registerCapability('onoff', 'SWITCH_BINARY');
        this.registerCapability('dim', 'SWITCH_MULTILEVEL');

        this.registerCapability('measure_power', 'METER');
        this.registerCapability('meter_power', 'METER');

        this.registerReportListener('BASIC', 'BASIC_SET', (report) => {
          this.setCapabilityValue('onoff', !!report.Value);
        });
    }

}

module.exports = FT111C;