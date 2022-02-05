import { User, HyProxy, settings } from "./utils/classes/HyProxy";
import { appendFileSync, existsSync, readdirSync, writeFileSync } from "fs";
import Command from "./utils/classes/command";
import chalk from "chalk";
import { Client, ServerClient } from "minecraft-protocol";
import { join } from "path";
import { configTemplate } from "./utils/settings.json";
import configSchema from "./config";

const configPath = "./HyProxyConfig.json"
if (!existsSync(configPath)) appendFileSync(configPath, JSON.stringify(configTemplate, null, 4))
import config from "./HyProxyConfig.json"

if (!('username' in config) || !('password' in config) || !('auth' in config)) {
	console.log(chalk.redBright`! No login found`)
	login();
} else init();

async function login() {
	const rl = await import('readline');
	const readline = rl.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	readline.question(chalk.greenBright`Email: `, (email: string) => {
		readline.question(chalk.greenBright`Password: `, (password: string) => {
			readline.question(chalk.greenBright`Migrated (yes/no): `, (answer: string) => {
				const yes: string[] = ["yes", "y", "eys", "yse", "yea"] // Honestly they should just follow orders instructions
				const copy: any = config;
				copy.username = email;
				copy.password = password;
				copy.auth = yes.includes(answer.toString().toLowerCase()) ? "microsoft" : "mojang";
				writeFileSync(`HyProxyConfig.json`, JSON.stringify(copy, null, 4))
				console.clear();
				readline.close();
			})
		})
	})
	readline.on("SIGINT", () => process.exit())
	readline.on("close", () => init())
}

function init() {
	let Config: settings;
	try {
		Config = configSchema.parse(config);
	} catch (e: any) {
		const configError = JSON.parse(e)[0]
		if (['username', 'password', 'auth'].includes(configError.path[0])) {
			console.log(chalk.redBright` ! Your ${configError.path[0]} is invalid!`)
			return login()
		}
		console.log(chalk.redBright` ! ${configError.message}`)
		return
	}

	const user: User = {
		commands: new Map<string, Command>(),
		overwrites: new Map(),
		lastGame: null,
		mode: null,
		config: Config
	};

	(['commands', 'overwrites'] as const).forEach(folder => {
		const files: string[] = readdirSync(join(__dirname, `./${folder}`)).filter(file => file.endsWith(".js"))
		files.forEach(async (file: string): Promise<void> => {
			const { default: command } = await import(`./${folder}/${file}`)
			const created: Command = new command
			user[folder].set(created.name, created)
		})
	})

	const proxy = new HyProxy(
		(config as any).username,
		(config as any).password,
		(config as any).auth === "mojang" ? "mojang" : "microsoft",
		25565,
		user
	)
	proxy.start();

	proxy.on("outgoing", (message: string, client: ServerClient, server: Client) => {
		const args: string[] = message.slice(user.config.prefix.length).split(/ +/);
		const commandName: string = args?.shift()?.toLowerCase()!;
		const command = user.commands.get(commandName) ||
			user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(commandName))?.[0]!)

		if (!command) return
		command.run(message, args, client, server, user)
		console.log(chalk.greenBright` > ${client.username} ran ${command.name}`)
	})
}

process.on("uncaughtException", (err) => {
	if (err.message.match("Invalid credentials.")) {
		console.clear();
		console.log(chalk.redBright` ! Your login is invalid!`);
		login();
	}
	process.exit()
})