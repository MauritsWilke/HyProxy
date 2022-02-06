import { playerStats } from "./api/hypixel"
import Message from "./classes/message";
import Card from "./classes/card";

export default async function parseStats(username: string, message: string) {
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
		overwriteMessage.addText(replacer[0]);
		if (replacer[1]) overwriteMessage.onHover(replacer[1])
	}

	return overwriteMessage
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

// #region Bedwars
const bedwarsModesMap = new Map([
	["overall", ""],
	["solo", "eight_one_"],
	["solos", "eight_one_"],
	["double", "eight_two_"],
	["doubles", "eight_two_"],
	["three", "four_three_"],
	["threes", "four_three_"],
	["four", "four_four_"],
	["fours", "four_four_"],
])

const bedwarsModes = [
	"Solo",
	"Doubles",
	"Threes",
	"Fours"
]

function getPlayerBedwars(path: string[], player: any) {
	const bw = player.stats.Bedwars;
	const mode = bedwarsModesMap.get(path[0]) ?? "";
	switch (path[path.length - 1]) {
		case "star": return [`[${player?.achievements?.bedwars_level || 0}${returnSuffix(player?.achievements?.bedwars_level || 0)}]`]

		case "fdkr":
		case "fkdr": {
			const card = new Card(`${player.displayname} - FKDR`)
			const modeStat = Math.round((bw?.[mode + "final_kills_bedwars"] / bw?.[mode + "final_deaths_bedwars"]) * 100) / 100 || 0
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round((bw?.[apiMode + "final_kills_bedwars"] / bw?.[apiMode + "final_deaths_bedwars"]) * 100) / 100 || 0}`
				card.addField(`${mode}: `, modeStat)
			})
			return [`${modeStat}FKDR`, card.toClassic()]
		}

		case "kdr": {
			const card = new Card(`${player.displayname} - KDR`)
			const modeStat = Math.round((bw?.[mode + "eight_two_kills_bedwars"] / bw?.[mode + "eight_two_deaths_bedwars"]) * 100) / 100 || 0;
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round((bw?.[apiMode + "eight_two_kills_bedwars"] / bw?.[apiMode + "eight_two_deaths_bedwars"]) * 100) / 100 || 0}`
				card.addField(`${mode}: `, modeStat)
			})
			return [`${modeStat}KDR`, card.toClassic()]
		}

		case "bblr": {
			const card = new Card(`${player.displayname} - BBLR`)
			const modeStat = Math.round((bw?.[mode + "eight_two_beds_broken_bedwars"] / bw?.[mode + "eight_two_beds_lost_bedwars"]) * 100) / 100 || 0
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round((bw?.[apiMode + "eight_two_beds_broken_bedwars"] / bw?.[apiMode + "eight_two_beds_lost_bedwars"]) * 100) / 100 || 0}`
				card.addField(`${mode}: `, modeStat)
			})
			return [`${modeStat}BBLR`, card.toClassic()]
		}

		case "wlr": {
			const card = new Card(`${player.displayname} - WLR`)
			const modeStat = Math.round((bw?.[mode + "eight_two_wins_bedwars"] / bw?.[mode + "eight_two_losses_bedwars"]) * 100) / 100 || 0
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round((bw?.[apiMode + "eight_two_wins_bedwars"] / bw?.[apiMode + "eight_two_losses_bedwars"]) * 100) / 100 || 0}`
				card.addField(`${mode}: `, modeStat)
			})
			return [`${modeStat}WLR`, card.toClassic()]
		}

		case "ws":
		case "winstreak": {
			const card = new Card(`${player.displayname} - WS`)
			const modeStat = bw?.[mode + "winstreak"] ?? "disabled"
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${bw?.[apiMode + "winstreak"] ?? "disabled"}`
				card.addField(`${mode}: `, modeStat)
			})
			return [`${modeStat}WS`, card.toClassic()]
		}

		case "index": {
			const card = new Card(`${player.displayname} - index`)
			const modeStat = Math.round(((player?.achievements?.bedwars_level || 0) * ((bw?.[mode + "final_kills_bedwars"] / bw?.[mode + "final_deaths_bedwars"]) ** 2)) / 10)
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round(((player?.achievements?.bedwars_level || 0) * ((bw?.[apiMode + "final_kills_bedwars"] / bw?.[apiMode + "final_deaths_bedwars"]) ** 2)) / 10)}`
				card.addField(`${mode}: `, modeStat)
			})
			return [`${modeStat} index`, card.toClassic()]
		}

		default: return "invalid path"
	}
}

function returnSuffix(level: number) {
	return level <= 1099 ? "✫" : level < 2099 ? "✪" : "⚝"
}
// #endregion

// (async () => {
// 	const msg = await parseStats("I_Like_Cats__", "{bw.star} {username}: {bw.fkdr} - {bw.index}")
// 	console.log(JSON.stringify(msg, null, 4))
// })()