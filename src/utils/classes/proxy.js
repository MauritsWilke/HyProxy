const { createServer, createClient, states, ping } = require("minecraft-protocol");
const chalk = require("chalk");
const EventEmitter = require("events");
const { join } = require("path");
const { deepParse } = require("../util")
const { toFormatting, Message } = require("./message")
const configPath = join(process.cwd(), "HyProxyConfig.json")
const config = require(configPath)
const design = config.config;

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
		const realHypixel = await ping({ host: "mc.hypixel.net" })

		const localhost = createServer({
			"online-mode": true,
			port: this.port,
			keepAlive: false,
			version: "1.8.9",
			motd: realHypixel.description,
			favicon: realHypixel.favicon,
			maxPlayers: realHypixel.players.max
		})
		localhost.playerCount = realHypixel.players.online;

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
					if (!endedTargetClient) hypixel.end("The proxy seems to have failed...");
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
					if (!endedClient) client.end("Hypixel seems to have failed...")
				})
			})

			setTimeout(() => {
				[
					`-`.repeat(53),
					`  Welcome, ${client.username}`,
					`  Connected to Hypixel through ${config.name}`,
					`  Run ${config.prefix}help to see the commands`,
					`-`.repeat(53),
				].forEach(msg => {
					const message = new Message(msg, { color: design.colours.default }).stringify()
					client.write("chat", { message: message })
				})
			}, 2000)

			//#region 
			// setTimeout(() => {
			// 	if (!config?.apiKey) {
			// 		const msg = new Message(`No API key found`, { color: design.colours.failed })
			// 			.newLine()
			// 			.addText("Please set one by running ")
			// 			.addText("/setkey ")
			// 			.onClick("suggest_command", "/setkey")
			// 			.onHover(new Message("/setkey", { color: design.colours.default }).classic())
			// 			.newLine()
			// 			.addText('<your API key>')
			// 			.onClick("suggest_command", "/api new")
			// 			.onHover(
			// 				new Message("Hypixel API key", {})
			// 			)

			// 	}


			// 	const text = new MessageComponent(`${templates.failed}No api key found!\n${templates.failed}Please set one by running `)
			// 	const hoverComp = new MessageComponent(`${templates.failed}/setkey `)
			// 		.onClick("suggest_command", "/setkey")
			// 		.onHover("§c/setkey")
			// 	const apiComp = new MessageComponent(`${templates.failed}<your api key>`)
			// 		.onClick("suggest_command", "/api new")
			// 		.onHover(`§aHypixel API key`, [`§aThis key is used to request from the Hypixel API`, `§aGenerate a new one by running /api new`])
			// 	const msg = new Message({ components: [text, hoverComp, apiComp] }).stringify();
			// 	if (!apiKey) {
			// 		client.write("chat", { message: msg, position: 0 })
			// 	}
			// }, 5000)
			//#endregion

			setInterval(() => {
				hypixel.write("chat", { message: `/locraw` })
			}, 5000)

			client.on("packet", (data, meta, buffer) => {

				let preventSend = false;
				const serialized = client.deserializer.parsePacketBuffer(buffer)
				if (serialized?.data?.name === "chat") {
					const msg = serialized.data.params.message;

					if (msg.startsWith(this.user.prefix)) {
						const commandName = msg.split(/ +/)[0].slice(this.user.prefix.length).toLowerCase();
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
				const serialized = hypixel.deserializer.parsePacketBuffer(buffer);
				if (serialized?.data?.name === "chat") {
					this.emit("incoming", serialized.data.params.message, client, hypixel)

					const parsed = deepParse(serialized.data.params.message);
					if (parsed?.text?.mode) this.user.mode = parsed.text.mode.toLowerCase();
					if (parsed?.text?.gametype) this.user.gametype = parsed.text.gametype.toLowerCase();
					if (parsed?.text?.server || parsed?.text?.gametype || parsed?.text?.mode) return;

					const classicStyle = toFormatting(parsed);
					const flatClean = classicStyle.replace(/§./g, "");

					const overwrite = this.user.overwrites.get(this.user.gametype);
					if (overwrite && flatClean.match(/ has joined \(\d\/\d\)!/)) {
						const ign = flatClean.replace(/ has joined \(\d\/\d\)!/, "");
						return overwrite.overwrite(client, parsed, classicStyle, flatClean, ign)
					}
				}

				if (meta.state === states.PLAY && client.state === states.PLAY && !endedClient) {
					client.write(meta.name, data);
					if (meta.name === "set_compression") client.compressionThreshold = data.threshold;
				}
			});
		})
	}
}

module.exports = Proxy;