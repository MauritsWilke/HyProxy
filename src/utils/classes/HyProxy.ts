import { createServer, createClient, states, ping, ServerClient, createDeserializer, PacketMeta } from "minecraft-protocol";
import chalk from "chalk";
import EventEmitter from "events";
import Command from "./command";
import { z } from "zod";
import configSchema from "../../config";
import settingsTemplate from "../settings.json"
import Message from "./message";
import { deepParse } from "../util";

export type settings = z.infer<typeof configSchema>
export interface User {
	commands: Map<string, Command>,
	overwrites: Map<string, Command>
	lastGame: string | null,
	mode: string | null,
	config: settings
}

export class HyProxy extends EventEmitter {
	constructor(
		public username: string,
		public password: string,
		public auth: "mojang" | "microsoft" = "microsoft",
		public port = 25565,
		public user: User
	) {
		super()
	}

	async start() {
		const hyPing = await ping({
			host: "mc.hypixel.net"
		})

		const realHypixel = {
			motd: "description" in hyPing ? typeof hyPing.description === "string" ? hyPing.description : hyPing.description.text : hyPing.motd,
			favicon: "favicon" in hyPing ? hyPing.favicon : "",
			maxPlayers: "maxPlayers" in hyPing ? hyPing.maxPlayers : hyPing.players.max,
			playerCount: "playerCount" in hyPing ? hyPing.playerCount : hyPing.players.online
		}

		const localhost = createServer({
			"online-mode": true,
			port: this.port,
			keepAlive: false,
			version: "1.8.9",
			favicon: realHypixel.favicon,
			maxPlayers: realHypixel.maxPlayers,
			motd: realHypixel.motd
		})
		localhost.playerCount = realHypixel.playerCount

		console.log(chalk.greenBright` > Proxy has been started`)

		localhost.on("login", (client: ServerClient) => {
			console.log(chalk.greenBright` > Logging in to Hypixel as ${client.username}`)

			let endedClient = false;
			let endedHypixel = false;

			const hypixel = createClient({
				username: this.username,
				password: this.password,
				auth: this.auth,
				host: "mc.hypixel.net",
				port: this.port,
				keepAlive: false,
				version: "1.8.9",
			});

			["end", "error"].forEach(event => {
				client.on(event, () => {
					endedClient = true;
					if (!endedHypixel) hypixel.end("The proxy seems to have failed")
				})
			});

			["end", "error"].forEach(event => {
				hypixel.on(event, () => {
					endedHypixel = true;
					if (!endedClient) client.end("Hypixel seems to have failed...")
				})
			})

			setTimeout(() => {
				[
					"-".repeat(53),
					`  Welcome, ${client.username}`,
					`  Connected to Hypixel through ${settingsTemplate.name}`,
					`  Run ${this.user.config.prefix}help to see the commands`,
					"-".repeat(53),
				].forEach(msg => {
					const message = new Message(msg, { color: this.user.config.config.colours.default }).toString()
					client.write("chat", { message: message })
				})
			}, 2000)

			client.on("packet", (data: any, meta, buffer) => {
				const clientDeserializer = createDeserializer({
					state: client.state,
					isServer: client.isServer,
					version: client.version,
					customPackets: client.customPackets
				})
				const serialized = clientDeserializer.parsePacketBuffer(buffer)

				if (serialized?.data?.name === "chat") {
					const message = serialized.data.params.message;
					if (message.startsWith(this.user.config.prefix)) {
						const commandName = message.split(/ +/)[0].slice(this.user.config.prefix.length).toLowerCase();
						const command = this.user.commands.get(commandName) || [...this.user.commands].find(command => command[1]?.aliases?.includes(commandName))
						if (command) {
							this.emit("outgoing", message, client, hypixel)
							return;
						}
					}
				}

				if (hypixel.state === states.PLAY && meta.state === states.PLAY && !endedHypixel) hypixel.write(meta.name, data);
			})

			hypixel.on("packet", (data: any, meta: PacketMeta, buffer: Buffer) => {
				const serverDeserializer = createDeserializer({
					state: hypixel.state,
					isServer: hypixel.isServer,
					version: hypixel.version,
					customPackets: hypixel.customPackets
				})
				const serialized = serverDeserializer.parsePacketBuffer(buffer)

				if (serialized.data.name === "login") hypixel.write("chat", { message: "/locraw" })

				if (serialized?.data?.name === "chat") {
					this.emit("incoming", serialized.data.params.message, client, hypixel)

					const parsed = deepParse(serialized.data.params.message);
					if (parsed?.text?.gametype) this.user.mode = parsed.text.gametype.toLowerCase();
					if (parsed?.text?.mode) this.user.lastGame = parsed.text.mode.toLowerCase();
					if (parsed?.text?.server || parsed?.text?.gametype || parsed?.text?.mode) {
						return
					}
				}

				if (meta.state === states.PLAY && client.state === states.PLAY && !endedClient) {
					client.write(meta.name, data);
					if (meta.name === "set_compression") client.compressionThreshold = data.threshold;
				}
			})
		})
	}
}