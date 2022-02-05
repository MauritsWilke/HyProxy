import { readdirSync } from "fs";
import { Client, ServerClient } from "minecraft-protocol";
import Command from "../utils/classes/command";
import type { User } from "../utils/classes/HyProxy";
import Message from "../utils/classes/message";

export default class extends Command {
	constructor() {
		super({
			name: "reload",
			description: "Reload command(s)",
			example: "reload help"
		})
	}

	run(message: string, args: string[], client: ServerClient, server: Client, user: User) {
		const design = user.config.config;

		user.commands = new Map<string, Command>();
		user.overwrites = new Map();

		(["commands", "overwrites"] as const).forEach(folder => {
			const files: string[] = readdirSync(`./${folder}`).filter(file => file.endsWith(".js"))
			files.forEach(async (file: string): Promise<void> => {
				const { default: command } = await import(`../${folder}/${file}`)
				const created: Command = new command
				user[folder].set(created.name, created)
			})
		})

		const msg = new Message("Successfully reloaded all commands!", { color: design.colours.success }).toString()
		client.write("chat", { message: msg })

	}
}