import { Client, ServerClient } from "minecraft-protocol";
import Card from "../utils/classes/card";
import Command from "../utils/classes/command";
import { User } from "../utils/classes/HyProxy";
import Message from "../utils/classes/message";

export default class extends Command {
	constructor() {
		super({
			name: "help",
			description: "Get help with HyProxy commands",
			example: "help requeue"
		})
	}

	run(message: string, args: string[], client: ServerClient, server: Client, user: User) {
		const design = user.config.config

		if (args.length === 0) {
			const msg = new Message("-------------------- Help --------------------", { color: design.colours.default, bold: true })
			for (const command of user.commands.values()) {
				const capitalName = command.name.charAt(0).toUpperCase() + command.name.slice(1);
				const helpCard = new Card(capitalName)
					.addField("Description: ", command.description)
					.addField("Example: ", command.example)
					.addField("Aliases: ", command.aliases?.join() || "None")
					.toClassic();

				msg.newLine();
				msg.addText(" » ", { bold: false })
					.addText(`${capitalName}: `, { bold: true })
					.addText(command.description, { bold: false })
					.onHover(helpCard, 3)
					.onClick("run_command", `${user.config.prefix}help ${command.name}`, 3)
			}
			msg.newLine().addText("-".repeat(45));
			return client.write("chat", { message: msg.toString() })
		} else {
			const command = user.commands.get(args[0]) ||
				user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(args[0]))?.[0]!)

			if (!command) {
				const msg = new Message(`That command doesn't exist! Run ${user.config.prefix} help to see a list of all commands`, { color: design.colours.failed })
					.toString();
				client.write("chat", { message: msg })
				return;
			}

			const helpMsg = new Message("-".repeat(53), { color: design.colours.default })
				.addText("Name: ", { bold: true }).addText(command.name).newLine()
				.addText("Description: ", { bold: true }).addText(command?.description ?? "none?").newLine()
				.addText("Example: ", { bold: true }).addText(command?.example ?? "none?").newLine()
				.addText("Aliases: ", { bold: true }).addText(command?.aliases?.join() || "none").newLine()
				.addText("-".repeat(53), { color: design.colours.default })
				.onClick("suggest_command", `${user.config.prefix}${command.name}`, "all")
				.toString();
			client.write("chat", { message: helpMsg })
		}
	}
}