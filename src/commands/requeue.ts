import { Client, ServerClient } from "minecraft-protocol";
import Command from "../utils/classes/command";
import type { User } from "../utils/classes/HyProxy";
import Message from "../utils/classes/message";

export default class extends Command {
	constructor() {
		super({
			name: "requeue",
			description: "Requeue your last game",
			example: "requeue",
			aliases: [
				"rq"
			]
		})
	}

	run(message: string, args: string[], client: ServerClient, server: Client, user: User) {
		const design = user.config.config;
		if (!user.lastGame) {
			const msg = new Message(`You haven't played any games yet!`, { color: design.colours.failed })
			return client.write("chat", { message: msg.toString() })
		} else {
			server.write('chat', { message: `/play ${user.lastGame}` })
		}
	}
}