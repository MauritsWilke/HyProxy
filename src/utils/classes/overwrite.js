

module.exports = class {
	constructor(config) {
		config = {
			mode: "",
			...config
		}

		Object.assign(this, config)
		this.mode = this.mode.toLowerCase()
	}
}

/* TEMPLATE

const Overwrite = require('../utils/overwrite')
const { MessageComponent, Message } = require("../utils/message")
const { } = require("../utils/templates.json")
const { } = require(join(process.cwd(), "./config.json"))

module.exports = class extends Overwrite {
	constructor() {
		super({
			mode: ""
		})
	}

	async overwrite(client, message, server, user) {

	}
}

*/