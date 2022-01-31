const Overwrite = require("../utils/classes/overwrite");
const { Message, Card } = require("../utils/classes/message");
const { playerStats } = require("../utils/api/hypixel")
const { join } = require("path")
const config = require(join(process.cwd(), "HyProxyConfig.json"))
const design = config.config

module.exports = class extends Overwrite {
	constructor() {
		super({
			mode: "bedwars"
		})
	}

	async overwrite(client, parsed, classic, clean, username) {
		const player = await playerStats(username, "Bedwars");
		const FKDR = Math.round((player.final_kills_bedwars / player.final_deaths_bedwars) * 100) / 100 || 0;
		const soloFKDR = Math.round((player.eight_one_final_kills_bedwars / player.eight_one_final_deaths_bedwars) * 100) / 100 || 0;
		const doublesFKDR = Math.round((player.eight_two_final_kills_bedwars / player.eight_two_final_deaths_bedwars) * 100) / 100 || 0;
		const threesFKDR = Math.round((player.four_three_final_kills_bedwars / player.four_three_final_deaths_bedwars) * 100) / 100 || 0;
		const foursFKDR = Math.round((player.four_four_final_kills_bedwars / player.four_four_final_deaths_bedwars) * 100) / 100 || 0;
		const fkdrCard = new Card(`${username} - FKDR`)
			.addField("Overall: ", FKDR)
			.addField("Solo: ", soloFKDR)
			.addField("Doubles: ", doublesFKDR)
			.addField("Threes: ", threesFKDR)
			.addField("Fours: ", foursFKDR)
			.classic();

		const winstreak = player.winstreak || 0;
		const soloWinstreak = player.eight_one_winstreak || 0;
		const doublesWinstreak = player.eight_two_winstreak || 0;
		const threesWinstreak = player.four_three_winstreak || 0;
		const foursWinstreak = player.four_four_winstreak || 0;
		const winstreakCard = new Card(`${username} - Winstreaks`)
			.addField("Overall: ", winstreak)
			.addField("Solo: ", soloWinstreak)
			.addField("Doubles: ", doublesWinstreak)
			.addField("Threes: ", threesWinstreak)
			.addField("Fours: ", foursWinstreak)
			.classic();

		const styledUsername = classic.replace(/ has joined.*/, "")
		const msg = new Message(` ${design.joinIcon} ${styledUsername} `, { color: "yellow" })
			.addText("fkdr: ", { color: "red" })
			.addText(`${FKDR} `, { color: "red" })
			.onHover(fkdrCard, 2)
			.addText("ws: ", { color: "red" })
			.addText(`${winstreak} `, { color: "red" })
			.onHover(winstreakCard, 2)
			.addText(clean.match(/\(\d\/\d\)/)[0])

		client.write("chat", { message: msg.stringify() })
	}
}