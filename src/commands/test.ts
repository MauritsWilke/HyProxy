import { Client, ServerClient } from "minecraft-protocol";
import Command from "../utils/classes/command";
import type { User } from "../utils/classes/HyProxy";

export default class extends Command {
	constructor() {
		super({
			name: "test",
			description: "test stuff",
			example: "test",
		})
	}

	run(message: string, args: string[], client: ServerClient, server: Client, user: User) {
		const msg = {
			"text": "",
			"extra": [
				{
					"text": "",
					"color": "yellow"
				},
				{
					"text": "[348✫]",
					"color": "yellow"
				},
				{
					"text": " ",
					"color": "yellow"
				},
				{
					"text": "I_Like_Cats__",
					"color": "yellow"
				},
				{
					"text": ": ",
					"color": "yellow"
				},
				{
					"text": "3.15FKDR",
					"color": "yellow",
					"hoverEvent": {
						"action": "show_text",
						"value": "§r§e§l§nI_Like_Cats__ - FKDR§r\n§r§r§7§lSolo: §r§f1.96§r\n§r§r§7§lDoubles: §r§f3.07§r\n§r§r§7§lThrees: §r§f5.63§r\n§r§r§7§lFours: §r§f3.38§r"
					}
				},
				{
					"text": " - ",
					"color": "yellow"
				},
				{
					"text": "345 index",
					"color": "yellow",
					"hoverEvent": {
						"action": "show_text",
						"value": "§r§e§l§nI_Like_Cats__ - index§r\n§r§r§7§lSolo: §r§f134§r\n§r§r§7§lDoubles: §r§f328§r\n§r§r§7§lThrees: §r§f1104§r\n§r§r§7§lFours: §r§f397§r"
					}
				}
			]
		}
		client.write("chat", { message: JSON.stringify(msg) })
	}
}