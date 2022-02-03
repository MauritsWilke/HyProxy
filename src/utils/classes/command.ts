import { Client, ServerClient } from "minecraft-protocol";
import { User } from "./HyProxy";

interface Config {
	name: string;
	aliases?: string[];
	description: string;
	example: string;
}

export default abstract class Command {
	name: string;
	aliases?: string[] | undefined;
	description: string;
	example: string;
	constructor(config: Config) {
		this.name = config.name;
		this.aliases = config.aliases;
		this.description = config.description;
		this.example = config.example
		this.name = this.name.toLowerCase();
		this.aliases = this.aliases?.map(a => a.toLowerCase())
	}

	abstract run(message: string, args: string[], client: ServerClient, server: Client, user: User): any
}

/* TEMPLATE

import { Client, ServerClient } from "minecraft-protocol";
import Command from "../utils/classes/command";
import { User } from "../utils/classes/HyProxy";

export default class Test extends Command {
	constructor() {
		super({
			name: "",
			description: "",
			example: ""
		})
	}

	run(message: string, args: string[], client: ServerClient, server: Client, user: User) {

	}
}

*/