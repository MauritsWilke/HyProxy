const Command = require('../utils/command')
const mc = require('minecraft-protocol')

module.exports = class extends Command {
	constructor() {
		super({
			name: "ping",
		})
	}

	async run(client, message, args) {
		const ping = await mc.ping({
			host: "mc.hypixel.net",
		})
		client.write("chat", { message: JSON.stringify(`Your current ping is [${ping.latency}]`), position: 0, sender: "0" });
	}
}