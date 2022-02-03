import { Client, ServerClient } from "minecraft-protocol";
import Command from "../utils/classes/command";
import { User } from "../utils/classes/HyProxy";

export default class extends Command {
	constructor() {
		super({
			name: "test",
			description: "test stuff :D",
			example: "test"
		})
	}

	run(message: string, args: string[], client: ServerClient, server: Client, user: User) {
		client.write("chat", { message: JSON.stringify(args?.join("") || "test") });
	}
}