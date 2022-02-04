// ! Very much work in progress!
// import { playerStats } from "./api/hypixel"

// async function statParser(username: string, message: string) {
// 	const needReplacing = message.match(/{[^]*?}/g);
// 	if (!needReplacing) return message;
// 	const stats = await playerStats(username);

// 	for (const repMe of needReplacing) {
// 		const replacer = getStats(repMe, stats)
// 		message = message.replaceAll(repMe, replacer)
// 	}
// 	return message
// }

// function getStats(path: string, stats: any) {
// 	let statPath = path.replace(/{|}/g, "").toLowerCase().split(".")
// 	switch (statPath[0]) {
// 		case 'username': {
// 			return stats.displayname
// 		}

// 		case 'bedwars': {
// 			return getBedwarsStats(statPath.slice(1), stats)
// 		}
// 	}
// }

// function getBedwarsStats(path: string[], stats: any) {
// 	const bw = stats.stats.Bedwars;
// 	switch (path[0]) {
// 		case 'overall': {
// 			switch (path[1]) {
// 				case 'fkdr': return Math.round((bw.final_kills_bedwars / bw.final_deaths_bedwars) * 100) / 100 || 0
// 				case 'kdr': return Math.round((bw.kills_bedwars / bw.deaths_bedwars) * 100) / 100 || 0
// 				default: return undefined
// 			}

// 		}
// 		default: return undefined
// 	}
// }

// (async () => {
// 	const msg = await statParser(`I_Like_Cats__`, `{username} has a {bedwars.overall.fkdr} FKDR uwu`)
// 	console.log(msg)
// })()