'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class FT139C extends ZwaveDevice {
	
	onMeshInit() {
		this.registerCapability('onoff', 'SWITCH_BINARY');

		this.registerReportListener('BASIC', 'BASIC_SET', (report) => {
			this.setCapabilityValue('onoff', !!report.Value);
		});
	}
	
}

module.exports = FT139C;