const Command = require('../utils/classes/command')
const { Message } = require("../utils/classes/message")
const { join } = require("path")
const config = require(join(process.cwd(), "HyProxyConfig.json"))
const design = config.config

module.exports = class extends Command {
	constructor() {
		super({
			name: "requeue",
			description: "Requeue the last game you joined",
			example: "requeue",
			aliases: [
				"rq"
			]
		})
	}

	async run(client, message, args, server, user) {
		if (!user.mode) {
			const msg = new Message(`You haven't played any games yet!`, { color: design.colours.failed }).stringify()
			client.write("chat", { message: msg })
		}
		else server.write("chat", { message: `/play ${user.mode}` })
	}
}