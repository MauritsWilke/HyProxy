const { createServer, createClient, states, ping } = require("minecraft-protocol");
const chalk = require("chalk");
const templates = require("./templates.json")
const EventEmitter = require("events");
const { join } = require("path");


class Proxy extends EventEmitter {
	constructor(username, password, auth, port, commands) {
		super();
		this.username = username;
		this.password = password;
		this.auth = auth || "microsoft";
		this.port = port || 25565;
		this.commands = commands || new Map();
	}

	async start() {
		const hyPing = await ping({
			host: "mc.hypixel.net"
		})

		const localhost = createServer({
			"online-mode": true,
			// host: "0.0.0.0",
			port: this.port,
			keepAlive: false,
			version: "1.8.9",
			motd: hyPing.description,
			favicon: hyPing.favicon,
			maxPlayers: hyPing.players.max
		})
		localhost.playerCount = hyPing.players.online;
		console.log(chalk.greenBright(" > Proxy has been started."));

		const data = {
			username: this.username,
			password: this.password,
			auth: this.auth,
		};

		localhost.on("login", client => {
			console.log(chalk.greenBright` > Logging in to Hypixel as ${client.username}`)

			let endedClient = false;
			let endedTargetClient = false;

			["end", "error"].forEach(event => {
				client.on(event, () => {
					endedClient = true;
					if (!endedTargetClient) hypixel.end("End");
				})
			})

			const hypixel = createClient({
				host: "hypixel.net",
				port: 25565,
				username: data.username,
				keepAlive: false,
				password: data.password,
				auth: data.auth,
				version: "1.8.9",
			});

			["end", "error"].forEach(event => {
				hypixel.on(event, () => {
					endedTargetClient = true;
					if (!endedClient) client.end("Hypixel gave up on life")
				})
			})

			setTimeout(() => {
				[
					templates.divider.repeat(templates.dividerWidth),
					`  Welcome, ${client.username}`,
					`  Connected to Hypixel through ${templates.name}`,
					`  Run /help to see the commands`,
					templates.divider.repeat(templates.dividerWidth)
				].forEach(msg => client.write("chat", { message: JSON.stringify(`${templates.colour}${msg}`), position: 0, sender: "0" }))
			}, 2000)

			client.on("packet", (data, meta, buffer) => {

				let preventSend = false;
				const serialized = client.deserializer.parsePacketBuffer(buffer)
				if (serialized?.data?.name === "chat") {
					const { prefix } = require(join(process.cwd(), "config.json"))
					const msg = serialized.data.params.message;

					if (msg.startsWith(prefix)) {
						const commandName = msg.split(/ +/)[0].slice(prefix.length).toLowerCase();
						const command = this.commands.get(commandName) || [...this.commands].find(command => command[1]?.aliases?.includes(commandName))
						if (command) {
							preventSend = true;
							this.emit("outgoing", msg, client, hypixel)
						}
					}
				}

				if (hypixel.state === states.PLAY && meta.state === states.PLAY && !endedTargetClient && !preventSend) hypixel.write(meta.name, data);
			});

			hypixel.on("packet", (data, meta, buffer) => {
				let preventSend = false;
				const serialized = hypixel.deserializer.parsePacketBuffer(buffer);
				if (serialized?.data?.name === "chat") {
					this.emit("incoming", serialized.data.params.message, client, hypixel)
				}

				if (meta.state === states.PLAY && client.state === states.PLAY && !endedClient && !preventSend) {
					client.write(meta.name, data);
					if (meta.name === "set_compression") client.compressionThreshold = data.threshold;
				}
			});
		})
	}
}

module.exports = Proxy;