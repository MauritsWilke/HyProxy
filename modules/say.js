module.exports = class {
	constructor() {
		this.name = "say2" // lowercase without spaces
		this.description = "say stuff uwu"
		this.example = "say I am a very cool human" // no prefix needed
	}

	/**
	 * 
	 * @param {object} client The user 
	 * @param {string} message The message the user sent without prefix
	 * @param {array<string>} args Arguments after the command name
	 * @param {object} server Hypixel 
	 * @param {object} user Bot information
	 */
	async run(client, message, args, server, user) {
		client.write("chat", { message: JSON.stringify(args?.join("") ?? "test") });
	}
}