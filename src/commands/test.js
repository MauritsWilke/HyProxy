const Command = require('../utils/command')
const { testMsg } = require("../utils/message")

module.exports = class extends Command {
	constructor() {
		super({
			name: "test",
			description: "Test stuff",
			example: "no",
		})
	}

	async run(client, message, args, server, user) {
		client.write("chat", { message: testMsg })
	}
}