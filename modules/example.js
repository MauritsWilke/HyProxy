module.exports = class {
	constructor() {
		this.name = "commandName" // lowercase without spaces
		this.description = "this is my epic command description"
		this.example = "commandName argument1 argument2" // no prefix needed
		this.aliases = [
			"custom"
		]
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
		client.write("chat", { message: JSON.stringify("Only the user can see this message!") });
		server.write("chat", { message: "this message is send to Hypixel!" });
	}
}