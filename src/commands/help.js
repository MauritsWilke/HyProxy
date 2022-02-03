const Command = require('../utils/classes/command')
const { Message, Card } = require("../utils/classes/message")
const config = require(process.env.CONFIG_FILE)
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
					.addField(`Description: `, command?.description)
					.addField(`Example: `, command?.example)
					.addField(`Aliases: `, command?.aliases?.join() || "None")
					.classic();

				msg.newLine();
				msg.addText(" » ", { bold: false })
					.addText(`${capitalName}: `, { bold: true })
					.addText(command.description, { bold: false })
					.onHover(helpCard, 3)
					.onClick("run_command", `${user.prefix}help ${command.name}`, 3)
			}
			msg.newLine().addText("-".repeat(45));
			return client.write("chat", { message: msg.stringify() })
		} else {
			const command = user.commands.get(args[0]) ||
				user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(args[0]))?.[0])
			if (!command) {
				const msg = new Message(`That command doesn't exist! Run /help to see a list of all commands`, { color: design.colours.failed })
					.stringify();
				client.write("chat", { message: msg })
				return;
			}
			const helpMsg = new Message(`-`.repeat(53), { color: design.colours.default })
				.addText(`Name: `, { bold: true }).addText(command.name).newLine()
				.addText(`Description: `, { bold: true }).addText(command?.description ?? "none?").newLine()
				.addText(`Example: `, { bold: true }).addText(command?.example ?? "none?").newLine()
				.addText(`Aliases: `, { bold: true }).addText(command?.aliases.join() || "none").newLine()
				.addText(`-`.repeat(53), { color: design.colours.default })
				.onClick("suggest_command", `${user.prefix}${command.name}`, "all")
				.stringify();
			client.write("chat", { message: helpMsg })
		}
	}
}