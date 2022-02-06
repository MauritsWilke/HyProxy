// /* eslint-disable camelcase */
// import { EasyPresence } from "easy-presence"
// const client = new EasyPresence("939857197817552936");

// const validAssets = ["bedwars"]
// export function updateActivity(mode: string) {
// 	const activity: any = {
// 		details: `Playing ${mode}`,
// 		state: "Subtext will be added later",
// 		assets: {
// 			// eslint-disable-next-line camelcase
// 			large_image: "hypixel",
// 			// eslint-disable-next-line camelcase
// 			large_text: "mc.hypixel.net",
// 		},
// 		timestamps: { start: new Date() }
// 	}
// 	if (validAssets.includes(mode)) {
// 		activity.assets.small_text = mode.charAt(0).toUpperCase() + mode.slice(1)
// 		activity.assets.small_image = mode;
// 	}
// 	client.setActivity(activity);
// }

// setInterval(() => {
// 	const started = new Date()
// 	client.setActivity({
// 		details: "Playing Hypixel",
// 		state: "1 kill - 2 finals - 3 beds",
// 		assets: {
// 			// eslint-disable-next-line camelcase
// 			large_image: "hypixel",
// 			// eslint-disable-next-line camelcase
// 			large_text: "mc.hypixel.net",
// 		},
// 		timestamps: { start: started }
// 	})
// }, 1000);