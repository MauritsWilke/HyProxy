const { readdirSync, writeFileSync, existsSync, appendFileSync } = require("fs")
const { resolve, join } = require('path');
const Proxy = require("./utils/proxy");
const { fullParse } = require("./utils/util")
const chalk = require("chalk")
const { flatText } = require("./utils/message")
const { name } = require("./utils/templates.json")
const configFile = join(process.cwd(), "./config.json")
if (!existsSync(configFile)) appendFileSync(configFile, JSON.stringify({ prefix: "/" }, null, 4), (err) => { if (err) return })
const config = require(configFile)

process.stdout.write("\033]0;" + name + "\007");

if (!config.username || !config.password || !config.auth) login();
else init();

function init() {
	const user = {
		commands: new Map(),
		overwrites: new Map(),
		lastGame: null,
		mode: null
	};

	const commandFiles = readdirSync(join(__dirname, `./commands`)).filter(file => file.endsWith('.js'))
	for (const file of commandFiles) {
		const commandPath = join(__dirname, `./commands/${file}`);
		const commandTemplate = require(resolve(commandPath));
		const command = new commandTemplate
		user.commands.set(command.name, command)
		delete require.cache[resolve(commandPath)]
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
		const { prefix } = require(configFile)
		const args = message.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = user.commands.get(commandName) ||
			user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(commandName))[0])

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
			// !
			client.write("chat", { message: JSON.stringify(ign) })
		}
	})
	proxy.start();
}

function login() {
	const readline = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	});

	readline.question(chalk.redBright` ! No login found` + chalk.greenBright`\nEmail: `, email => {
		readline.question(chalk.greenBright`Password: `, password => {
			readline.question(chalk.greenBright`Migrated (yes/no): `, bool => {
				const yes = ["yes", "y", "eys", "yse", ""]
				const copy = config;
				copy.username = email;
				copy.password = password;
				copy.auth = yes.includes(bool.toString().toLowerCase()) ? "microsoft" : "mojang";
				writeFileSync(join(process.cwd(), "./config.json"), JSON.stringify(copy, null, 4))
				console.clear();
				readline.close();
			})
		})
	})
	readline.on("close", () => init())
}

process.on("uncaughtException", (e, o) => {
	console.clear();
	if (e.message.match("Invalid credentials.")) {
		console.log(chalk.redBright`Your credentials are incorrect!`)
		const copy = config;
		delete copy.username;
		delete copy.password;
		delete copy.auth;
		writeFileSync(configFile, JSON.stringify(copy, null, 4))
		return login();
	} else console.log(chalk.redBright`An error has occured\n\n`);
	console.log(e)
	process.exit();
})