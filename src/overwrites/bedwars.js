const Overwrite = require('../utils/overwrite')
const { MessageComponent, Message } = require("../utils/message")
const { } = require("../utils/templates.json")

module.exports = class extends Overwrite {
	constructor() {
		super({
			mode: "bedwars"
		})
	}

	async overwrite(client, parsed, flat, clean, username) {
		console.log(flat)

		client.write("chat", { message: JSON.stringify(` + ${username}`) })
	}
}