import Card from "../classes/card";
import Message, { Colours } from "../classes/message";
import sc from "./starColours.json"
const starColours: any = sc

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
	"",
	"Solo",
	"Doubles",
	"Threes",
	"Fours"
]

export function getPlayerBedwars(path: string[], player: any) {
	const bw = player.stats.Bedwars;
	const mode = bedwarsModesMap.get(path[0]) ?? "";
	let style = "upper"
	if (["clean", "upper", "lower", "num"].includes(path[path.length - 1])) {
		style = path.pop()!
	}

	switch (path[path.length - 1]) {
		case "star": return starColour(player?.achievements?.bedwars_level || 0)

		case "fdkr":
		case "fkdr": {
			const card = new Card(`${player.displayname} - FKDR`)
			const modeStat = Math.round((bw?.[mode + "final_kills_bedwars"] / bw?.[mode + "final_deaths_bedwars"]) * 100) / 100 || 0
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round((bw?.[apiMode + "final_kills_bedwars"] / bw?.[apiMode + "final_deaths_bedwars"]) * 100) / 100 || 0}`
				card.addField(`${mode || "Overall"}: `, modeStat)
			})
			return [`${modeStat}${statSuffix("FKDR", style)}`, card.toClassic()]
		}

		case "kdr": {
			const card = new Card(`${player.displayname} - KDR`)
			const modeStat = Math.round((bw?.[mode + "eight_two_kills_bedwars"] / bw?.[mode + "eight_two_deaths_bedwars"]) * 100) / 100 || 0;
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round((bw?.[apiMode + "eight_two_kills_bedwars"] / bw?.[apiMode + "eight_two_deaths_bedwars"]) * 100) / 100 || 0}`
				card.addField(`${mode || "Overall"}: `, modeStat)
			})
			return [`${modeStat}${statSuffix("KDR", style)}`, card.toClassic()]
		}

		case "bblr": {
			const card = new Card(`${player.displayname} - BBLR`)
			const modeStat = Math.round((bw?.[mode + "eight_two_beds_broken_bedwars"] / bw?.[mode + "eight_two_beds_lost_bedwars"]) * 100) / 100 || 0
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round((bw?.[apiMode + "eight_two_beds_broken_bedwars"] / bw?.[apiMode + "eight_two_beds_lost_bedwars"]) * 100) / 100 || 0}`
				card.addField(`${mode || "Overall"}: `, modeStat)
			})
			return [`${modeStat}${statSuffix("BBLR", style)}`, card.toClassic()]
		}

		case "wlr": {
			const card = new Card(`${player.displayname} - WLR`)
			const modeStat = Math.round((bw?.[mode + "eight_two_wins_bedwars"] / bw?.[mode + "eight_two_losses_bedwars"]) * 100) / 100 || 0
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round((bw?.[apiMode + "eight_two_wins_bedwars"] / bw?.[apiMode + "eight_two_losses_bedwars"]) * 100) / 100 || 0}`
				card.addField(`${mode || "Overall"}: `, modeStat)
			})
			return [`${modeStat}${statSuffix("WLR", style)}`, card.toClassic()]
		}

		case "ws":
		case "winstreak": {
			const card = new Card(`${player.displayname} - WS`)
			const modeStat = bw?.[mode + "winstreak"] ?? "disabled "
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${bw?.[apiMode + "winstreak"] ?? "disabled "}`
				card.addField(`${mode || "Overall"}: `, modeStat)
			})
			return [`${modeStat}${statSuffix("WS", style)}`, card.toClassic()]
		}

		case "index": {
			const card = new Card(`${player.displayname} - index`)
			const modeStat = Math.round(((player?.achievements?.bedwars_level || 0) * ((bw?.[mode + "final_kills_bedwars"] / bw?.[mode + "final_deaths_bedwars"]) ** 2)) / 10)
			bedwarsModes.forEach(mode => {
				const apiMode = bedwarsModesMap.get(mode.toLowerCase()) ?? "";
				const modeStat = `${Math.round(((player?.achievements?.bedwars_level || 0) * ((bw?.[apiMode + "final_kills_bedwars"] / bw?.[apiMode + "final_deaths_bedwars"]) ** 2)) / 10)}`
				card.addField(`${mode || "Overall"}: `, modeStat)
			})
			return [`${modeStat}${statSuffix(" index", style)}`, card.toClassic()]
		}

		default: return "invalid path"
	}
}

function returnSuffix(level: number) {
	return level <= 1099 ? "✫" : level < 2099 ? "✪" : "⚝"
}

function starColour(star: number) {
	const suffix = returnSuffix(star)
	const styledStar = new Message(`[${star}${suffix}]`, {
		color: <Colours>starColours[Math.floor(star / 100)]
	}).toClassic();
	return styledStar
}

function statSuffix(word: string, style: string): string {
	switch (style) {
		case "num":
		case "clean": return ""
		case "lower": return word.toLowerCase();
		case "upper":
		default: return word.toUpperCase();
	}
}