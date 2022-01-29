const Command = require('../utils/command')
const config = require("../config.json")

module.exports = class extends Command {
	constructor() {
		super({
			name: "requeue",
			aliases: [
				"rq"
			]
		})
	}

	async run(client, message, args, hypixel, user) {
		if (!user.lastGame) client.write("chat", { message: JSON.stringify(`You haven't played any games yet`), position: 0, sender: "0" })
		else hypixel.write("chat", { message: `/play ${user.lastGame}` })
	}
}