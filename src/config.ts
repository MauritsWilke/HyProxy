import { z } from "zod"

const colourEnum = z.enum([
	"black",
	"dark_blue",
	"dark_green",
	"dark_aqua",
	"dark_red",
	"dark_purple",
	"gold",
	"gray",
	"dark_gray",
	"blue",
	"green",
	"aqua",
	"red",
	"light_purple",
	"yellow",
	"white"
])

const configSchema = z.object({
	prefix: z.string().min(1, {
		message: "Prefix must have at least length of 1"
	}),
	username: z.string().email({
		message: "Username must be an email!"
	}),
	password: z.string(),
	auth: z.enum(["mojang", "microsoft"]),
	apiKey: z.string().optional(),

	config: z.object({
		colours: z.object({
			default: colourEnum,
			success: colourEnum,
			failed: colourEnum
		}),
		overwrites: z.object({
			bedwars: z.string().or(z.object({
				overall: z.string(),
				solos: z.string().optional(),
				doubles: z.string().optional(),
				threes: z.string().optional(),
				fours: z.string().optional(),
			}))
		}),
		joinIcon: z.string()
	})
})

export default configSchema