const Homey = require('homey');

class OomiApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);
		let rainbowAction = new Homey.FlowCardAction('ft098-k_rainbow')
            .register()
            .registerRunListener((args, state) => {
            	return args.device.rainbowModeHandler(args);
			});
	}
}

module.exports = OomiApp;
