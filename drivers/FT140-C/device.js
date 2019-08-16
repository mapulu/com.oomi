'use strict';

const { ZwaveDevice } = require('homey-meshdriver');

class FT140C extends ZwaveDevice {

	onMeshInit() {
		this.registerCapability('onoff', 'BASIC');
	}

}

module.exports = FT140C;
