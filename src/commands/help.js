const Command = require('../utils/command')
const { MessageComponent, Message } = require("../utils/message")
const { divider, dividerWidth, colour } = require("../utils/templates.json")
const { join } = require("path");
const { prefix } = require(join(process.cwd(), "config.json"))


module.exports = class extends Command {
	constructor() {
		super({
			name: "help",
			description: "Lists all commands or shows info for a specific command",
			example: "help requeue"
		})
	}

	async run(client, message, args, server, user) {
		if (args.length === 0) {
			const msg = []
			const divMessage = new Message({ text: divider.repeat(dividerWidth) }).stringify();
			msg.push(divMessage)
			for (const command of user.commands.values()) {
				const helpName = new MessageComponent(` ${colour}§l• ${command.name} `)
					.onHover(`${colour}${command.name}`, [`${colour}${command.example}`])
					.onClick("run_command", `${prefix}help ${command.name}`);

				const helpDesc = new MessageComponent(command.description);
				const helpMessage = new Message({ components: [helpName, helpDesc] }).stringify();
				msg.push(helpMessage)
			}
			msg.push(divMessage)

			msg.forEach(msg => client.write("chat", { message: msg, position: 0, sender: "0" }))
			return;
		} else {
			const command = user.commands.get(args[0]) || user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(args[0]))[0])
			if (!command) return;
			const msg = []
			const divMessage = new Message({ text: divider.repeat(dividerWidth) }).stringify();
			msg.push(divMessage)
			const helpName = new MessageComponent(` ${colour}§l• Name: §r${command.name}\n`)
			const helpDesc = new MessageComponent(` ${colour}§l• Description: §r${command.description}\n`)
			const helpExam = new MessageComponent(` ${colour}§l• Example: §r${command.example}\n`)
				.onClick("suggest_command", `${prefix}${command.example}`)
			const helpAlias = new MessageComponent(` ${colour}§l• Aliases: §r${command?.aliases?.join() ?? "None :("}`)

			msg.push(new Message({ components: [helpName, helpDesc, helpExam, helpAlias] }).stringify())
			msg.push(divMessage)

			msg.forEach(msg => client.write("chat", { message: msg, position: 0, sender: "0" }))
		}
	}
}