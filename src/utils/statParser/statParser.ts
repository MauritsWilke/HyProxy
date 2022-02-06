import { playerStats } from "../api/hypixel"
import Message from "../classes/message";
import { getPlayerBedwars } from "./bedwars";

export default async function parseStats(username: string, message: string) {
	try {
		const splitMessage = message.split(/({[^]*?})/g).filter(v => v !== "");
		const player = await playerStats(username);

		const overwriteMessage = new Message("", { color: "yellow" })
		for (const part of splitMessage) {
			if (!part.match(/{[^]*?}/)) {
				overwriteMessage.addText(part)
				continue;
			}

			const replacer = getStats(part, player);
			if (replacer === "invalid path") {
				overwriteMessage.addText("invalid path", { color: "red" })
				continue;
			}
			if (Array.isArray(replacer)) {
				overwriteMessage.addText(replacer[0]);
				overwriteMessage.onHover(replacer[1])
			} else overwriteMessage.addText(replacer)
		}

		return overwriteMessage
	} catch (error: any) {
		return new Message(`${username} is nicked!`, { color: "dark_red" })
	}
}

function getStats(part: string, player: any) {
	const path = part.replace(/{|}/g, "").split(".");
	if (path.length === 0) return "invalid path"
	switch (path[0]) {
		case "username": return getPlayerOverall(path.slice(1), player)
		case "bw":
		case "bedwars": return getPlayerBedwars(path.slice(1), player)

		default: return "invalid path"
	}
}

function getPlayerOverall(path: string[], player: any) {
	switch (path[0]) {
		default: return [player.displayname]
	}
}