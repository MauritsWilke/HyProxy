import { User, HyProxy } from "./utils/classes/HyProxy";
import config from "./HyProxyConfig.json"
import { readdirSync } from "fs";
import Command from "./utils/classes/command";
import chalk from "chalk";
import { Client, ServerClient } from "minecraft-protocol";
import { join } from "path";

function init() {
	const user: User = {
		commands: new Map<string, Command>(),
		overwrites: new Map(),
		lastGame: null,
		mode: null,
		prefix: config.prefix ?? "/"
	};

	(['commands', 'overwrites'] as const).forEach(folder => {
		const files: string[] = readdirSync(join(__dirname, `./${folder}`)).filter(file => file.endsWith(".js"))
		files.forEach(async (file: string) => {
			const path: string = `./${folder}/${file}`;
			const { default: command } = await import(path)
			const created: Command = new command
			user[folder].set(created.name, created)
		})
	})

	const proxy = new HyProxy(
		config.username,
		config.password,
		config.auth === "mojang" ? "mojang" : "microsoft",
		25565,
		user
	)
	proxy.start();

	proxy.on("outgoing", (message: string, client: ServerClient, server: Client) => {
		const args: string[] = message.slice(user.prefix.length).split(/ +/);
		const commandName: string = args?.shift()?.toLowerCase()!;
		const command = user.commands.get(commandName) ||
			user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(commandName))?.[0]!)


		if (!command) return
		command.run(message, args, client, server, user)
		console.log(chalk.greenBright` > ${client.username} ran ${command.name}`)
	})
}

init();