const Command = require('../utils/classes/command')
const { Message } = require("../utils/classes/message")
const { writeFileSync } = require("fs")
const { join } = require("path")
const config = require(join(process.cwd(), "HyProxyConfig.json"))
const { keyInfo, setKey } = require("../utils/api/hypixel")
const design = config.config

module.exports = class extends Command {
	constructor() {
		super({
			name: "setkey",
			description: "Set the API key for HyProxy",
			example: "setkey abcdefgh-ijkl-mnop-qrst-uvwxyz123456",
			aliases: [
				"rq"
			]
		})
	}

	async run(client, message, args, server, user) {
		if (!args[0]) {
			const msg = new Message("Please provide an API key, generate one using /api new", { color: design.colours.failed }).stringify();
			client.write("chat", { message: msg })
		} else {
			try {
				const info = await keyInfo(args[0]);
				config.apiKey = info.key;
				setKey(info.key)
				writeFileSync(join(process.cwd(), "HyProxyConfig.json"), JSON.stringify(config, null, 4))
				const msg = new Message("Successfully set API key!", { color: design.colours.success }).stringify();
				client.write("chat", { message: msg })
			} catch (e) {
				console.log(e)
				const msg = new Message("Invalid API key! Generate a new one using /api new", { color: design.colours.failed }).stringify();
				client.write("chat", { message: msg })
			}
		}
	}
}