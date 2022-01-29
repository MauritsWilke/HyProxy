const Command = require('../utils/command')
const config = require("../config.json")

module.exports = class extends Command {
	constructor() {
		super({
			name: "test",
			aliases: [
				"test2"
			]
		})
	}

	async run(client, message, args) {
		const msg = {
			"translate": "chat.type.announcement",
			"with": [
				{
					"text": config.name,
					"clickEvent": {
						"action": "suggest_command",
						"value": "/l"
					},
					"hoverEvent": {
						"action": "show_text",
						"value": {
							"text": "&1la\n§1la\nla",
						}
					},
					"insertion": "Suck my balls"
				},
				{
					"text": message
				}
			]
		}

		client.write("chat", { message: JSON.stringify(msg), position: 0, sender: "0" });
	}
}