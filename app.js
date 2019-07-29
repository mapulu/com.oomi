'use strict';

const Homey = require('homey');

class OomiApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);

	}
}

module.exports = OomiApp;
