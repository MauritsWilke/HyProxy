const { readdirSync, writeFileSync, existsSync, appendFileSync } = require("fs")
const { resolve, join } = require('path');
const Proxy = require("./utils/classes/proxy");
const chalk = require("chalk")
const { name } = require("./utils/settings.json")
const configFile = join(process.cwd(), "./HyProxyConfig.json")
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
		mode: null,
		prefix: config.prefix ?? "/"
	};

	["commands", "overwrites"].forEach(folder => {
		const typeFiles = readdirSync(join(__dirname, `./${folder}`)).filter(file => file.endsWith('.js'))
		typeFiles.forEach(file => {
			const filePath = join(__dirname, `./${folder}/${file}`);
			const template = require(resolve(filePath));
			const created = new template
			user[folder].set(created?.name || created.mode, created)
			delete require.cache[resolve(filePath)]
		})
	})

	const proxy = new Proxy(
		config.username,
		config.password,
		config.auth,
		25565,
		user
	);

	proxy.on("outgoing", (message, client, server) => {
		const args = message.slice(user.prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = user.commands.get(commandName) ||
			user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(commandName))[0])

		if (!command) return
		command.run(client, message, args, server, user)
		console.log(chalk.greenBright` > ${client.username} ran ${command.name}`)
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
				const yes = ["yes", "y", "eys", "yse", "yea"] // Honestly they should just follow orders instructions
				const copy = config;
				copy.username = email;
				copy.password = password;
				copy.auth = yes.includes(bool.toString().toLowerCase()) ? "microsoft" : "mojang";
				writeFileSync(configFile, JSON.stringify(copy, null, 4))
				console.clear();
				readline.close();
			})
		})
	})
	readline.on("close", () => init())
}

process.on("uncaughtException", (e, o) => {
	// console.clear();
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