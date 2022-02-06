const classicFormatting = new Map<string, string>([
	["black", "§0"],
	["dark_blue", "§1"],
	["dark_green", "§2"],
	["dark_aqua", "§3"],
	["dark_red", "§4"],
	["dark_purple", "§5"],
	["gold", "§6"],
	["gray", "§7"],
	["dark_gray", "§8"],
	["blue", "§9"],
	["green", "§a"],
	["aqua", "§b"],
	["red", "§c"],
	["light_purple", "§d"],
	["yellow", "§e"],
	["white", "§f"],
	["obfuscated", "§k"],
	["bold", "§l"],
	["strikethrough", "§m"],
	["underlined", "§n"],
	["italic", "§o"],
	["reset", "§r"]
])

function messageToFormatting(msg: any) {
	let formatted = msg?.text || "";
	const copy = Object.assign({}, msg);
	delete copy?.extra;
	formatted += toFormatting(copy)
	if (msg?.extra) {
		for (const ex of msg.extra) {
			formatted += toFormatting(ex)
		}
	}
	return formatted
}

function toFormatting(msg: MessageType): string {
	const exclude = ["text", "clickEvent", "hoverEvent", "insertion"]
	let formatted = ""
	for (const [style, value] of Object.entries(msg)) {
		let str = "";
		if (style === "color" && typeof value === "string") str += classicFormatting.get(value);
		else if (!exclude.includes(style) && value) str += classicFormatting.get(style);
		formatted += str
	}
	formatted += msg.text + "§r"
	return formatted
}

type Colours = "black" | "dark_blue" | "dark_green" | "dark_aqua" | "dark_red" | "dark_purple" | "gold" | "gray" | "dark_gray" | "blue" | "green" | "aqua" | "red" | "light_purple" | "yellow" | "white"

type Styles = {
	bold?: boolean | null;
	color?: Colours;
	italic?: boolean | null;
	underlined?: boolean | null;
	strikethrough?: boolean | null;
	obfuscated?: boolean | null;
}

type MessageType = Styles & {
	text: string;
	hoverEvent?: hoverEvent,
	clickEvent?: clickEvent,
	insertion?: string,
	extra?: Array<Omit<MessageType, "extra">>
}

type hoverEvent = {
	action: "show_text",
	value: string
}

type clickEventTypes = "open_url" | "run_command" | "suggest_command" | "copy_to_clipboard"
type clickEvent = {
	action: clickEventTypes,
	value: string
}

class Message {
	styling: Styles;
	message;
	constructor(text: string | null, styling: Styles = {}) {
		this.styling = styling;
		this.message = {
			text: "",
			extra: Array<MessageType>()
		}

		this.message.extra.push({
			text: text || "",
			...styling,
		})
	}

	toString(): string {
		return JSON.stringify(this.message)
	}

	toJson(): MessageType {
		return this.message
	}

	toClassic(): string {
		const { extra: extra, ...rest } = this.message;
		let classic = toFormatting(rest);
		for (const ex of extra) classic += toFormatting(ex)
		return classic
	}

	addText(text: string, styling: Styles = {}): this {
		this.message.extra.push({
			text: text,
			...this.styling,
			...styling
		})
		return this
	}

	appendText(text: string, styling: Styles = {}): this {
		this.message.extra.unshift({
			text: text,
			...this.styling,
			...styling
		})
		return this
	}

	newLine(amount = 1): this {
		while (amount--) this.message.extra.push({ text: "\n" })
		return this
	}

	onHover(text: string, amount: number | "all" = 1): this {
		if (amount > this.message.extra.length || amount === "all") amount = this.message.extra.length
		while (amount) {
			this.message.extra[this.message.extra.length - amount].hoverEvent = {
				action: "show_text",
				value: text
			}
			amount--
		}
		return this
	}

	onClick(type: clickEventTypes, value: string, amount: number | "all" = 1): this {
		if (amount > this.message.extra.length || amount === "all") amount = this.message.extra.length
		while (amount) {
			this.message.extra[this.message.extra.length - amount].clickEvent = { action: type, value: value }
			amount--
		}
		return this
	}

	insertion(text: string, amount: number | "all" = 1): this {
		if (amount > this.message.extra.length || amount === "all") amount = this.message.extra.length
		while (amount) {
			this.message.extra[this.message.extra.length - amount].insertion = text;
			amount--
		}
		return this
	}
}

export {
	Message as default,
	Message,
	Styles,
	Colours,
	toFormatting,
	messageToFormatting
}
