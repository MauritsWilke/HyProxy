const Command = require('../utils/command')

module.exports = class extends Command {
	constructor() {
		super({
			name: "clear",
		})
	}

	async run(client, message, args, server, user) {
		for (let i = 0; i < 10; i++)	client.write("chat", { message: JSON.stringify(" ".repeat(Math.floor(Math.random() * 100))), position: 0, sender: "0" });
	}
}