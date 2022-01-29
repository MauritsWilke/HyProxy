module.exports = class {
	/**
	 * Default command template
	 * @param {Object} config - The command configuration
	 * @param {string} config.name - The name of the command
	 * @param {array} config.aliases - The aliases of the bot
	 */
	constructor(config) {
		config = {
			name: "",
			aliases: null,
			...config
		}

		Object.assign(this, config)
		this.name = this.name.toLowerCase()
		this.aliases = this.aliases?.map(a => a.toLowerCase())
	}
}