// @ts-nocheck

function statParser(username: string, message: string) {
	const stats = message.match(/{[^]*?}/g);

	if (!stats) return message;
	for (const stat of stats) {
		getStats(stat)
	}
}

function getStats(stat: string) {
	const splitted: string[] = stat.split(".");

	switch (splitted[0]) {
		case 'bedwars': {
			if (!splitted[1]) return "invalid path"
			return bedwarsStats(splitted.slice(1))
		}
	}
	return "invalid path"
}

function bedwarsStats(specific: string[], stats): string {
	switch (specific[0]) {
		case "overall": {
			switch (specific[1]) {
				case "fkdr": {
					return Math.round((bw.final_kills_bedwars / bw.final_deaths_bedwars) * 100) / 100 || 0
				}
			}
		}
	}
}

console.log(statParser(`I_Like_Cats__`, `{username} has a {bedwars.overall.fkdr} uwu`))