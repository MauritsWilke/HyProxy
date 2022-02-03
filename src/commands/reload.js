const Command = require('../utils/classes/command')
const { Message } = require("../utils/classes/message")
const { readdirSync, existsSync } = require("fs")
const { resolve, join } = require('path');
const config = require(process.env.CONFIG_FILE)
const design = config.config

module.exports = class extends Command {
	constructor() {
		super({
			name: "reload",
			description: "Reload all commands, or a specific command",
			example: "reload help",
		})
	}

	async run(client, message, args, server, user) {
		if (args.length === 0) {
			const msg = new Message(`Reloading all commands`, { color: design.colours.success })
				.stringify();
			client.write("chat", { message: msg })

			user.commands = new Map();
			["commands"].forEach(folder => {
				const typeFiles = readdirSync(join(__dirname, `../${folder}`)).filter(file => file.endsWith('.js'))
				typeFiles.forEach(file => {
					const filePath = join(__dirname, `../${folder}/${file}`);
					const template = require(resolve(filePath));
					const created = new template
					user[folder].set(created?.name || created.mode, created)
					delete require.cache[resolve(filePath)]
				})
			})

			if (existsSync(process.env.MODULES)) {
				const customFiles = readdirSync(process.env.MODULES).filter(file => file.endsWith(".js"))
				customFiles.forEach(file => {
					const filePath = join(process.env.MODULES, `/${file}`);
					const template = require(resolve(filePath));
					const created = new template
					user.commands.set(created?.name || created.mode, created)
					delete require.cache[resolve(filePath)]
				})
			}

			const successMsg = new Message(`Succesfully reloaded all commands!`, { color: design.colours.success })
				.stringify();
			client.write("chat", { message: successMsg })

		} else {
			const command = user.commands.get(args[0]) ||
				user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(args[0]))?.[0])
			if (!command) {
				const msg = new Message(`That command doesn't exist! Run /help to see a list of all commands`, { color: design.colours.failed })
					.stringify();
				client.write("chat", { message: msg })
				return;
			}

			user.commands.delete(command.name)
			let filePath = join(__dirname, `../commands/${command.name}.js`);
			console.log(filePath)
			if (!existsSync(filePath)) filePath = join(__dirname, `commands/${command.name}.js`);
			if (!existsSync(filePath)) {
				const msg = new Message(`That command exists but has an incorrect file name!`, { color: design.colours.failed })
					.stringify();
				client.write("chat", { message: msg })
				return;
			}
			const template = require(resolve(filePath));
			const created = new template
			user.commands.set(created?.name || created.mode, created)
			delete require.cache[resolve(filePath)]

			const successMsg = new Message(`Succesfully reloaded ${command.name}!`, { color: design.colours.success })
				.stringify();
			client.write("chat", { message: successMsg })
		}
	}
}