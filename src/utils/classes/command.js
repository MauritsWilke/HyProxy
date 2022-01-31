module.exports = class {
	constructor(config) {
		config = {
			name: "",
			aliases: null,
			description: "",
			example: "",
			enabled: true,
			...config
		}

		Object.assign(this, config)
		this.name = this.name.toLowerCase()
		this.aliases = this.aliases?.map(a => a.toLowerCase())
	}
}

/* TEMPLATE

const Command = require('../utils/classes/command')
const { Message } = require("../utils/classes/message")
const { join } = require("path")
const config = require(join(process.cwd(), "HyProxyConfig.json"))
const design = config.config

module.exports = class extends Command {
	constructor() {
		super({
			name: "",
			description: "",
			example: "",
			aliases: [

			]
		})
	}

	async run(client, message, args, server, user) {

	}
}

*/