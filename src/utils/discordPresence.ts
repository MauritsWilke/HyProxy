/* eslint-disable camelcase */
import { EasyPresence } from "easy-presence"
const client = new EasyPresence("939857197817552936");
const started = new Date()

// const validAssets = ["bedwars"]
// export function updateActivity(mode: string, submode?: string) {
// 	const activity: any = {
// 		details: `Playing ${mode}`,
// 		state: `${submode ? submode : `In a ${mode} lobby`}`,
// 		assets: {
// 			// eslint-disable-next-line camelcase
// 			large_image: "hypixel",
// 			// eslint-disable-next-line camelcase
// 			large_text: "mc.hypixel.net",
// 		},
// 		timestamps: { start: started }
// 	}
// 	if (validAssets.includes(mode)) {
// 		activity.assets.small_text = mode.charAt(0).toUpperCase() + mode.slice(1)
// 		activity.assets.small_image = mode;
// 	}
// 	client.setActivity(activity);
// }

setInterval(() => {
	client.setActivity({
		details: "Using HyProxy",
		state: "Pre-release",
		assets: {
			// eslint-disable-next-line camelcase
			large_image: "hypixel",
			// eslint-disable-next-line camelcase
			large_text: "mc.hypixel.net",
		},
		timestamps: { start: started }
	})
}, 1000);