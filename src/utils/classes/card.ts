import { Message, Styles } from "./message";

export default class Card {
	nameStyle: Styles;
	statStyle: Styles;
	card: Message;
	fields: string[]
	constructor(title: string, titleStyle?: Styles, nameStyle?: Styles, statStyle?: Styles) {
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
		this.fields = []
	}

	toJson() {
		const cardJson = this.card.toJson()
		this.fields.forEach(field => cardJson.extra?.push({ text: field }));
		return cardJson
	}

	addField(name: string, value: string, nameStyle?: Styles, statStyle?: Styles): this {
		const field = new Message("")
			.addText(name, { ...this.nameStyle, ...nameStyle })
			.addText(value, { ...this.statStyle, ...statStyle }).toClassic();
		this.fields.push(field)
		return this;
	}

	addLine(text: string, style?: Styles): this {
		this.fields.push(new Message(text, style).toClassic());
		return this;
	}

	toClassic(): string {
		const cardClassic = this.card.toClassic();
		const fieldsClassic = this.fields.join("\n")
		return `${cardClassic}\n${fieldsClassic}`
	}
}