
class Message {
	constructor(username, text, type, hover, click) {
		this.msg = {
			"translate": type || "chat.type.announcement",
			"with": [
				{
					"text": username
				},
				{
					"text": text
				}
			],
		}

		if (hover) this.msg.with[0].hoverEvent = {
			"action": hover.action,
			"value": hover.value
		}
	}

	stringify = () => JSON.stringify(this.msg)
}


// console.log(new Message("de_grote", "balls").stringify())
// const msg = {
// 	"translate": "chat.type.announcement",
// 	"with": [
// 		{
// 			"text": "USER",
// 			"clickEvent": {
// 				"action": "suggest_command",
// 				"value": "/l"
// 			},
// 			"hoverEvent": {
// 				"action": "show_text",
// 				"value": {
// 					"text": "&1la\n§1la\nla",
// 				}
// 			},
// 			"insertion": "Suck my balls"
// 		},
// 		{
// 			"text": "ugh"
// 		}
// 	]
// }

// console.log(JSON.stringify(msg));