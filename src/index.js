const { readdirSync, appendFile } = require('fs');
const { resolve } = require('path');
const Proxy = require("./utils/proxy");
const { fullParse } = require("./utils/util")
const config = require("./config.json")

const user = {
	commands: new Map(),
	lastGame: null
};

const commandFiles = readdirSync(`./src/commands`).filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const commandTemplate = require(resolve(`./src/commands/${file}`));
	const command = new commandTemplate
	user.commands.set(command.name, command)
	delete require.cache[resolve(`./src/commands/${file}`)]
}

const proxy = new Proxy(
	config.username,
	config.password,
	config.auth,
	25565,
	user.commands
);

proxy.on("outgoing", (message, client, server) => {
	const args = message.slice(config.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = user.commands.get(commandName) || user.commands.get([...user.commands].find(command => command[1]?.aliases?.includes(commandName))[0])

	if (!command) return
	command.run(client, message, args, server, user)
	console.log(` > ${client.username} ran ${command.name}`)
})

proxy.on("incoming", (msg) => {
	msg = fullParse(msg)
	if (msg?.text?.mode) user.lastGame = msg.text.mode.toLowerCase();
})

proxy.start();