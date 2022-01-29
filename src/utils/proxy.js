const mc = require("minecraft-protocol");
const states = mc.states;
const chalk = require("chalk");
const config = require("../config.json")

const EventEmitter = require('events');

class Proxy extends EventEmitter {
	constructor(username, password, auth, port, commands) {
		super();
		this.username = username;
		this.password = password;
		this.auth = auth || "mojang";
		this.port = port || 25566;
		this.commands = commands || new Set();
	}

	start() {
		const localhost = mc.createServer({
			"online-mode": true,
			host: "0.0.0.0",
			port: this.port,
			keepAlive: false,
			version: "1.8.9",
		});

		// I DONT KNOW WHY THIS HAS TO STAY BUT IT HAS TO 
		const data = {
			username: this.username,
			password: this.password,
			auth: this.auth,
		};

		console.log(chalk.greenBright(" > Proxy has been started."));

		localhost.on("login", (client) => {
			setTimeout(() => {
				[
					"-".repeat(client.username.length + 8),
					`  Welcome, ${client.username}`,
					"-".repeat(client.username.length + 8)
				].forEach(msg => {
					client.write("chat", { message: JSON.stringify(`§4${msg}`), position: 0, sender: "0" })
				})
			}, 2500)

			let endedClient = false;
			let endedTargetClient = false;

			["end", "error"].forEach(event => {
				client.on(event, () => {
					endedClient = true;
					if (!endedTargetClient) hypixel.end("End");
				})
			})

			const hypixel = mc.createClient({
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

			client.on("packet", (data, meta, buffer) => {
				let preventSend = false;
				const serialized = client.deserializer.parsePacketBuffer(buffer)
				if (serialized?.data?.name === "chat") {
					const msg = serialized.data.params.message;
					const commandName = msg.split(/ +/)[0].slice(config.prefix.length).toLowerCase();
					const command = this.commands.get(commandName) || [...this.commands].find(command => command[1]?.aliases?.includes(commandName))

					if (command) {
						preventSend = true;
						this.emit("outgoing", msg, client, hypixel)
					}
				}

				if (hypixel.state === states.PLAY && meta.state === states.PLAY && !endedTargetClient && !preventSend) hypixel.write(meta.name, data);
			});

			hypixel.on("packet", (data, meta, buffer) => {
				let preventSend = false;
				const serialized = hypixel.deserializer.parsePacketBuffer(buffer);
				if (serialized?.data?.name === "chat") {
					this.emit("incoming", serialized.data.params.message)
				}

				if (meta.state === states.PLAY && client.state === states.PLAY && !endedClient && !preventSend) {
					client.write(meta.name, data);
					if (meta.name === "set_compression") client.compressionThreshold = data.threshold;
				}
			});


		});
	};
}

module.exports = Proxy;