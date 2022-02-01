const formatting = {
	"black": "§0",
	"dark_blue": "§1",
	"dark_green": "§2",
	"dark_aqua": "§3",
	"dark_red": "§4",
	"dark_purple": "§5",
	"gold": "§6",
	"gray": "§7",
	"dark_gray": "§8",
	"blue": "§9",
	"green": "§a",
	"aqua": "§b",
	"red": "§c",
	"light_purple": "§d",
	"yellow": "§e",
	"white": "§f",
	"obfuscated": "§k",
	"bold": "§l",
	"strikethrough": "§m",
	"underlined": "§n",
	"italic": "§o",
	"reset": "§r"
}

const styles = [
	"bold",
	"color",
	"italic",
	"underlined",
	"strikethrough",
	"obfuscated"
]

const colours = [
	"black",
	"dark_blue",
	"dark_green",
	"dark_aqua",
	"dark_red",
	"dark_purple",
	"gold",
	"gray",
	"dark_gray",
	"blue",
	"green",
	"aqua",
	"red",
	"light_purple",
	"yellow",
	"white",
]

function validateStyles(style) {
	for (const [key, value] of Object.entries(style)) {
		if (key === "color") {
			if (!colours.includes(value)) return false;
		}
		else if (!styles.includes(key) || typeof value !== "boolean") return false
	}
	return true
}

function toFormatting(obj) {
	const exclude = ["text", "clickEvent", "hoverEvent"]
	let formatted = obj?.text || "";
	if (!obj?.extra) return formatted

	for (const entry of obj.extra) {
		let str = "";
		for (const [style, value] of Object.entries(entry)) {
			if (style === "color") str += formatting[value]
			else if (!exclude.includes(style) && value) str += formatting[style]
		}
		formatted += str + entry.text + "§r"
	} return formatted
}

class Message {
	constructor(text, styling = {}) {
		if (!validateStyles(styling)) throw new Error("Invalid styling")
		this.styling = styling;
		this.message = {
			text: "",
			extra: [
				{
					text: text || "",
					...styling
				}
			]
		}
	}

	stringify = () => JSON.stringify(this.message);
	json = () => this.message
	classic = () => toFormatting(this.message)

	addText(text, styling) {
		this.message.extra.push({
			"text": text,
			...this.styling,
			...styling
		})
		return this
	}

	addComponent(component) {
		this.message.extra.push(component)
		return this
	}

	newLine(amount = 1) {
		while (amount--) this.message.extra.push({ text: "\n" })
		return this
	}

	onHover(text, amount = 1) {
		if (amount > this.message.extra.length || amount === "all") amount = this.message.extra.length
		while (amount) {
			this.message.extra[this.message.extra.length - amount].hoverEvent = {
				"action": "show_text",
				"value": text,
			}
			amount--
		}
		return this
	}

	onClick(type, value, amount = 1) {
		if (amount > this.message.extra.length || amount === "all") amount = this.message.extra.length
		while (amount) {
			if (!["open_url", "run_command", "suggest_command", "copy_to_clipboard"].includes(type)) throw new Error("Invalid type")
			this.message.extra[this.message.extra.length - amount].clickEvent = { action: type, value: value }
			amount--
		}
		return this
	}

	insertion(text) {
		this.message.extra[this.message.extra.length - 1].insertion = text;
		return this
	}
}

class Card {
	constructor(title, titleStyle, nameStyle, statStyle) {
		titleStyle = {
			color: "yellow",
			bold: true,
			underlined: true,
			...titleStyle
		}
		this.nameStyle = {
			color: "gray",
			bold: true,
			...nameStyle
		};
		this.statStyle = {
			color: "white",
			...statStyle
		}

		this.card = new Message(title, titleStyle)
		this.fields = [];
	}

	addField(name = "", value = "", nameStyle, statStyle) {
		const field = new Message()
			.addText(name, { ...this.nameStyle, ...nameStyle })
			.addText(value, { ...this.statStyle, ...statStyle }).classic();
		this.fields.push(field)
		return this;
	}

	addLine(text, style) {
		this.fields.push(new Message(text, style).classic())
		return this
	}

	classic() {
		const cardClassic = this.card.classic();
		let fieldsClassic = this.fields.join("\n");
		return `${cardClassic}\n${fieldsClassic}`
	}

	json() {
		const cardJson = this.card.json();
		this.fields.forEach(field => cardJson.extra.push({ text: field }))
		return cardJson
	}
}

module.exports = {
	Message,
	Card,
	toFormatting,
	validateStyles
}