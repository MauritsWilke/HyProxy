const Command = require('../utils/classes/command')
const { Message, Card } = require("../utils/classes/message")
const { join } = require("path")
const config = require(join(process.cwd(), "HyProxyConfig.json"))
const design = config.config

module.exports = class extends Command {
	constructor() {
		super({
			name: "help",
			description: "Get help with HyProxy commands!",
			example: "help requeue",
			aliases: [

			]
		})
	}

	async run(client, message, args, server, user) {
		if (args.length === 0) {
			let msg = new Message(`-------------------- Help --------------------`, { color: design.colours.default, bold: true });
			for (const command of user.commands.values()) {
				const capitalName = command.name.charAt(0).toUpperCase() + command.name.slice(1)
				const helpCard = new Card(capitalName)
					.addField(`Description: `, command.description)
					.addField(`Example: `, command.example)
					.addField(`Aliases: `, command.aliases.join() || "None")
					.classic();

				msg.newLine();
				msg.addText(" » ", { bold: false })
					.addText(`${capitalName}: `, { bold: true })
					.addText(command.description, { bold: false })
					.onHover(helpCard, 3)
					.onClick("suggest_command", `${user.prefix}help ${command.name}`, 3)
			}
			msg.newLine().addText("-".repeat(45));
			return client.write("chat", { message: msg.stringify() })
		}
	}
}