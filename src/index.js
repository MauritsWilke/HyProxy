const { readdirSync, writeFileSync, existsSync } = require("fs")
const { resolve, join } = require('path');
const Proxy = require("./utils/proxy");
const { fullParse } = require("./utils/util")
const chalk = require("chalk")
const { flatText } = require("./utils/message")
const { name } = require("./utils/templates.json")
process.stdout.write("\033]0;" + name + "\007");

if (!existsSync(join(process.cwd(), "./config.json"))) {
	const { open } = require("fs")
	open(join(process.cwd(), "./config.json"), "w", (err, file) => {
		if (err) return;
	})
	const setup = { prefix: "/" }
	writeFileSync(join(process.cwd(), "./config.json"), JSON.stringify(setup, null, 4))

}
const config = require(join(process.cwd(), "./config.json"))

console.log(config);
if (!config.username || !config.password || !config.auth) {
	const readline = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	});

	readline.question(` ! No login found\nEmail: `, email => {
		readline.question(`Password: `, password => {
			readline.question(`Migrated (yes/no): `, bool => {
				const copy = config;
				copy.username = email;
				copy.password = password;
				copy.auth = bool.toString().toLowerCase() === "yes" ? "microsoft" : "mojang";
				writeFileSync(join(process.cwd(), "./config.json"), JSON.stringify(copy, null, 4))
				console.clear();
				readline.close();
			})
		})
	})
	readline.on("close", () => init())
} else init();

function init() {
	const user = {
		commands: new Map(),
		overwrites: new Map(),
		lastGame: null,
		mode: null
	};

	const commandFiles = readdirSync(join(__dirname, `./commands`)).filter(file => file.endsWith('.js'))
	for (const file of commandFiles) {
		const commandTemplate = require(resolve(join(__dirname, `./commands/${file}`)));
		const command = new commandTemplate
		user.commands.set(command.name, command)
		delete require.cache[resolve(join(__dirname, `./commands/${file}`))]
	}

	// const overwrites = readdirSync(`./src/overwrite`).filter(file => file.endsWith('.js'))
	// for (const file of overwrites) {
	// 	const overwriteTemplate = require(resolve(`./src/overwrite/${file}`));
	// 	const overwrite = new overwriteTemplate
	// 	user.overwrites.set(overwrite.game, overwrite)
	// 	delete require.cache[resolve(`./src/overwrite/${file}`)]
	// }

	const proxy = new Proxy(
		config.username,
		config.password,
		config.auth,
		25565,
		user.commands
	);

	proxy.on("outgoing", (message, client, server) => {
		const { join } = require("path");
		const { prefix } = require(join(process.cwd(), "config.json"))
		const args = message.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = user.commands.get(commandName) || user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(commandName))[0])

		if (!command) return
		command.run(client, message, args, server, user)
		console.log(chalk.greenBright` > ${client.username} ran ${command.name}`)
	})

	proxy.on("incoming", (msg, client, server) => {
		msg = fullParse(msg)
		if (msg?.text?.mode) {
			user.lastGame = msg.text.mode.toLowerCase();
			user.mode = msg.text.gametype.toLowerCase();
		}

		const flat = flatText(msg);
		const flatClean = flat.replace(/§./g, "");
		if (flatClean.match(/ has joined \(\d\/\d\)!/)) {
			const ign = flatClean.replace(/ has joined \(\d\/\d\)!/, "");
			client.write("chat", { message: JSON.stringify(ign) })
		}
	})
	proxy.start();
}

process.on("uncaughtException", (e, o) => {
	console.log(e)
	// console.clear();
	// console.log(chalk.redBright`Your credentials are incorrect!`)
	// const copy = config;
	// delete copy.username;
	// delete copy.password;
	// delete copy.auth;
	// writeFileSync(join(process.cwd(), "./src/config.json"), JSON.stringify(copy, null, 4))
	process.exit();
})