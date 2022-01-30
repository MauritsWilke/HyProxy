const Command = require('../utils/command')
const { MessageComponent, Message } = require("../utils/message")
const { failed, colour } = require("../utils/templates.json")
const { join } = require("path");
const config = require(join(process.cwd(), "config.json"))

module.exports = class extends Command {
	constructor() {
		super({
			name: "setkey",
			description: "Set the api key",
			example: "setkey 3b5f2f0a-9336-a78a-c2e0-5417ac8f2921 (this is a fake key :)",
		})
	}

	async run(client, message, args, server, user) {
		if (!args[0]) {
			return client.write("chat", { message: new Message({ text: `${failed}Please include an API key!` }).stringify() })
		}
		const { writeFileSync } = require("fs")
		const copy = config;
		copy.apiKey = args[0];
		writeFileSync(join(process.cwd(), "config.json"), JSON.stringify(copy, null, 4))
		client.write("chat", { message: new Message({ text: `${colour}Successfully set the api key!` }).stringify() })
	}
}