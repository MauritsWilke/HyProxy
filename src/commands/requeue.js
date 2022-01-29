const Command = require('../utils/command')
const { MessageComponent, Message } = require("../utils/message")
const { colour } = require("../utils/templates.json")

module.exports = class extends Command {
	constructor() {
		super({
			name: "requeue",
			description: "Requeue the last game you played!",
			example: "requeue",
			aliases: [
				"rq"
			]
		})
	}

	async run(client, message, args, server, user) {
		if (!user.lastGame) {
			const msg = new Message({ text: `${colour}You haven't played any games yet!` }).stringify()
			client.write("chat", { message: msg })
		}
		else server.write("chat", { message: `/play ${user.lastGame}` })
	}
}