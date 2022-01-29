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
	"underline": "§n",
	"italic": "§o",
	"reset": "§r"
}

class Message {
	constructor(obj) {
		this.message = {
			text: obj?.text || "",
		}

		if (obj.components) this.message.extra = obj.components.map(v => v.message)
	}

	stringify() {
		return JSON.stringify(this.message)
	}
}

class MessageComponent {
	constructor(text) {
		this.message = {
			text: text,
		}
	}

	onHover(title, fields) {
		fields = `\n${fields.join(`\n§r`)}`
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

module.exports = {
	MessageComponent,
	Message
}

// function flatText(obj) {
// 	console.log(obj)
// 	let flattened = "";
// 	for (const el of obj.extra) {
// 		let str = "";
// 		[
// 			"bold",
// 			"italic",
// 			"underlined",
// 			"obfuscated",
// 			"strikethrough",
// 			"color"
// 		].forEach(v => {
// 			if (el?.[v]) str += formatting[el[v]]
// 		})
// 		str += el.text
// 		flattened += str
// 	}
// 	return flattened
// }