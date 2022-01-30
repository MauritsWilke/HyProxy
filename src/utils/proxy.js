const { createServer, createClient, states, ping } = require("minecraft-protocol");
const chalk = require("chalk");
const templates = require("./templates.json")
const EventEmitter = require("events");
const { join } = require("path");
const { fullParse } = require("./util")
const { flatText, Message, MessageComponent } = require("./message")
const configPath = join(process.cwd(), "config.json")

class Proxy extends EventEmitter {
	constructor(username, password, auth, port, user) {
		super();
		this.username = username;
		this.password = password;
		this.auth = auth || "microsoft";
		this.port = port || 25565;
		this.user = user;
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

			setTimeout(() => {
				const { apiKey } = require(configPath)
				const text = new MessageComponent(`${templates.failed}No api key found!\n${templates.failed}Please set one by running `)
				const hoverComp = new MessageComponent(`${templates.failed}/setkey `)
					.onClick("suggest_command", "/setkey")
					.onHover("§c/setkey")
				const apiComp = new MessageComponent(`${templates.failed}<your api key>`)
					.onClick("suggest_command", "/api new")
					.onHover(`§aHypixel API key`, [`§aThis key is used to request from the Hypixel API`, `§aGenerate a new one by running /api new`])
				const msg = new Message({ components: [text, hoverComp, apiComp] }).stringify();
				if (!apiKey) {
					client.write("chat", { message: msg, position: 0 })
				}
			}, 5000)

			client.on("packet", (data, meta, buffer) => {

				let preventSend = false;
				const serialized = client.deserializer.parsePacketBuffer(buffer)
				if (serialized?.data?.name === "chat") {
					const { prefix } = require(configPath)
					const msg = serialized.data.params.message;

					if (msg.startsWith(prefix)) {
						const commandName = msg.split(/ +/)[0].slice(prefix.length).toLowerCase();
						const command = this.user.commands.get(commandName) || [...this.user.commands].find(command => command[1]?.aliases?.includes(commandName))
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

					const parsed = fullParse(serialized.data.params.message);
					if (parsed?.text?.mode) {
						this.user.lastGame = parsed.text.mode.toLowerCase();
						this.user.mode = parsed.text.gametype.toLowerCase();
					}
					const flat = flatText(parsed);
					const flatClean = flat.replace(/§./g, "");
					const overwrite = this.user.overwrites.get(this.user.mode);

					if (overwrite && flatClean.match(/ has joined \(\d\/\d\)!/)) {
						const ign = flatClean.replace(/ has joined \(\d\/\d\)!/, "");
						preventSend = true
						overwrite.overwrite(client, parsed, flat, flatClean, ign)
					}
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