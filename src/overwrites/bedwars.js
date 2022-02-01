const Overwrite = require("../utils/classes/overwrite");
const { Message, Card } = require("../utils/classes/message");
const { playerStats } = require("../utils/api/hypixel")
const starColours = require("../utils/api/json//starColours.json")
const { join } = require("path")
const config = require(join(process.cwd(), "HyProxyConfig.json"))
const design = config.config

module.exports = class extends Overwrite {
	constructor() {
		super({
			mode: "bedwars"
		})
	}

	async overwrite(client, parsed, classic, clean, username, styledUsername) {
		// const styledUsername = classic.replace(/ has joined.*/, "")
		try {
			const player = await playerStats(username);
			const star = player.achievements.bedwars_level
			const FKDR = Math.round((player.stats.Bedwars.final_kills_bedwars / player.stats.Bedwars.final_deaths_bedwars) * 100) / 100 || 0;
			const soloFKDR = Math.round((player.stats.Bedwars.eight_one_final_kills_bedwars / player.stats.Bedwars.eight_one_final_deaths_bedwars) * 100) / 100 || 0;
			const doublesFKDR = Math.round((player.stats.Bedwars.eight_two_final_kills_bedwars / player.stats.Bedwars.eight_two_final_deaths_bedwars) * 100) / 100 || 0;
			const threesFKDR = Math.round((player.stats.Bedwars.four_three_final_kills_bedwars / player.stats.Bedwars.four_three_final_deaths_bedwars) * 100) / 100 || 0;
			const foursFKDR = Math.round((player.stats.Bedwars.four_four_final_kills_bedwars / player.stats.Bedwars.four_four_final_deaths_bedwars) * 100) / 100 || 0;
			const fkdrCard = new Card(`${username} - FKDR`)
				.addField("Overall: ", FKDR)
				.addField("Solo: ", soloFKDR)
				.addField("Doubles: ", doublesFKDR)
				.addField("Threes: ", threesFKDR)
				.addField("Fours: ", foursFKDR)
				.classic();

			const winstreak = player.stats.Bedwars?.winstreak ?? "disabled";
			const soloWinstreak = player.stats?.Bedwars.eight_one_winstreak ?? "disabled";
			const doublesWinstreak = player.stats?.Bedwars.eight_two_winstreak ?? "disabled";
			const threesWinstreak = player.stats?.Bedwars.four_three_winstreak ?? "disabled";
			const foursWinstreak = player.stats?.Bedwars.four_four_winstreak ?? "disabled";
			const winstreakCard = new Card(`${username} - Winstreaks`)
				.addField("Overall: ", winstreak)
				.addField("Solo: ", soloWinstreak)
				.addField("Doubles: ", doublesWinstreak)
				.addField("Threes: ", threesWinstreak)
				.addField("Fours: ", foursWinstreak)
				.classic();

			const msg = new Message(` ${design.joinIcon} `, { color: "yellow" })
				.addText(`[${star}✫] `, { color: starColours[Math.floor(star / 100)] })
				.addText(`${styledUsername} `)
				.addText("fkdr: ", { color: "red" })
				.addText(`${FKDR} `, { color: "red" })
				.onHover(fkdrCard, 2)
				.addText("ws: ", { color: "red" })
				.addText(`${winstreak} `, { color: "red" })
				.onHover(winstreakCard, 2)
				.addText(clean.match(/\(\d{1,2}\/\d{1,2}\)/)?.[0] || "")

			client.write("chat", { message: msg.stringify() })
		} catch (e) {
			if (String(e).match("does not exist")) {
				const msg = new Message(` ${design.joinIcon} `, { color: "dark_red" })
					.addText(styledUsername)
					.addText(" is nicked!")
					.stringify()
				client.write("chat", { message: msg })
			} else {
				console.log(e)
				const msg = new Message(`Overwrite failed, please check application and report the bug!`, { color: "dark_red" })
				client.write("chat", { message: msg.stringify() })
			}
		}
	}
}