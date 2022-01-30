const { colour } = require("./templates.json")
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
	let flattened = obj?.text || "";
	if (!obj?.extra) return flattened

	for (const entry of obj.extra) {
		let str = "";
		for (const [style, value] of Object.entries(entry)) {
			if (style === "color") str += formatting[value]
			else if (style !== "text" && value) str += formatting[style]
		}
		flattened += str + entry.text
	} return flattened
}

class Message {
	constructor(text, styling = {}) {
		if (!validateStyles(styling)) throw new Error("Invalid styling")
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

	onHover(title, fields = []) {
		if (fields) fields = `\n${fields.join("\n")}`
		title = title.split(/(§.)/g);
		title.splice(title.length - 1, 0, "§l");
		this.message.extra[this.message.extra.length - 1].hoverEvent = {
			"action": "show_text",
			"value": `${title.join("")}${fields}`,
		}
		return this
	}

	onClick(type, value) {
		if (!["open_url", "run_command", "suggest_command", "copy_to_clipboard"].includes(type)) throw new Error("Invalid type")
		this.message.extra[this.message.extra.length - 1].clickEvent = { action: type, value: value }
		return this
	}

	insertion(text) {
		this.message.extra[this.message.extra.length - 1].insertion = text;
		return this
	}
}

/**
 * @deprecated
 */
class MessageComponent {
	constructor(text) {
		this.message = {
			text: text,
		}
	}

	onHover(title, fields = []) {
		if (fields) fields = `\n${fields.join(`\n§r`)}`
		title = title.split(/(§.)/g);
		title.splice(title.length - 1, 0, "§l");
		this.message['hoverEvent'] = {
			"action": "show_text",
			"value": `${title.join("")}${fields}`
		}
		return this
	}

	onClick(type, value) {
		this.message['clickEvent'] = {
			action: type,
			value: value
		}
		return this
	}
}

const testMsg = new Message()
	.addText("This is a test", { color: "red", bold: true })
	.onHover(new Message("Cool hover :3", { color: "red", bold: false }).classic(), [
		new Message("Testing", { color: "blue", underlined: true })
			.newLine()
			.addText("Testing", { color: "red", bold: true, obfuscated: true })
			.classic(),
	])
	.onClick("suggest_command", "/play bedwars_eight_two")
	.insertion("lmfao sike")
	.addText("green text :D", { color: "green" })
	.stringify();

module.exports = {
	MessageComponent,
	flatText: toFormatting,
	Message,
	toFormatting,
	testMsg
}