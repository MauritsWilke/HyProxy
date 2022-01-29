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

const Command = require('../utils/command')
const { MessageComponent, Message } = require("../utils/message")
const { } = require("../utils/templates.json")
const { } = require("../config.json")

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