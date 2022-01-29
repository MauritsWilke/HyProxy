const Command = require('../utils/command')
const { MessageComponent, Message } = require("../utils/message")
const { failed, colour } = require("../utils/templates.json")
const { join } = require("path");
const config = require(join(process.cwd(), "config.json"))

module.exports = class extends Command {
	constructor() {
		super({
			name: "prefix",
			description: "Change the prefix for the commands",
			example: "prefix !",
			aliases: [

			]
		})
	}

	async run(client, message, args, server, user) {
		if (!args[0]) return client.write("chat", { message: new Message({ text: `${failed}This command requires a prefix!` }).stringify() })
		const { writeFileSync } = require("fs")
		const { join } = require('path')
		const copy = config;
		copy.prefix = args[0];
		writeFileSync(join(process.cwd(), "config.json"), JSON.stringify(copy, null, 4))
		client.write("chat", { message: new Message({ text: `${colour}The prefix is now ${args[0]}` }).stringify() })
	}
}