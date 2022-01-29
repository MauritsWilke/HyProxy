const Command = require('../utils/command')
const mc = require('minecraft-protocol')

module.exports = class extends Command {
	constructor() {
		super({
			name: "help",
		})
	}

	async run(client, message, args, server, user) {
		const msg = ["-".repeat(20), ...[...user.commands.keys()].map(v => `  ${v}`), "-".repeat(20),]
		msg.forEach(msg => {
			client.write("chat", { message: JSON.stringify(msg), position: 0, sender: "0" });
		})
	}
}