import { Cache } from "../classes/cache";
import { request } from "undici";

const UUIDCache = new Cache();
const skinCache = new Cache();
const usernameCache = new Cache();

export {
	getUUID,
	getSkin,
	getUsername,
	getNameHistory
}

async function getUUID(username: string) {
	if (!valid(username)) return Promise.reject(`${username} is an invalid username`);
	const cached = UUIDCache.get(username);
	if (cached) return cached;
	const response = await request(`https://api.mojang.com/users/profiles/minecraft/${username}`)
	if (response.statusCode !== 200) return Promise.reject(`${username} does not exist`);
	const json = await response.body.json();
	UUIDCache.set(username, json.id);
	return json.id;
}

async function getSkin(username: string) {
	if (!valid(username)) return Promise.reject(`${username} is an invalid username`);
	const cached = skinCache.get(username);
	if (cached) return cached;
	const UUID = getUUID(username);
	const response = await request(`https://sessionserver.mojang.com/session/minecraft/profile/${UUID}`);
	if (response.statusCode !== 200) return Promise.reject(`Response returned statuscode ${response.statusCode}`);
	const json = await response.body.json();
	const r = JSON.parse(Buffer.from(json.properties[0].value, "base64").toString("ascii"));
	skinCache.set(username, r.textures.SKIN.url);
	return r.textures.SKIN.url;
}

async function getUsername(playerUUID: string) {
	if (!playerUUID.match(/[\d-]/i)) return Promise.reject("Please submit a valid UUID");
	const cached = usernameCache.get(playerUUID);
	if (cached) return cached
	const response = await request(`https://api.mojang.com/user/profiles/${playerUUID}/names`);
	if (response.statusCode !== 200) return Promise.reject(`Response returned statuscode ${response.statusCode}`);
	const json = await response.body.json();
	usernameCache.set(playerUUID, json[json.length - 1].name)
	return json[json.length - 1].name;
}

type NameHistory = {
	name: string,
	changedToAt: number
}
async function getNameHistory(username: string) {
	const nameHistory = new Map();
	if (username.length <= 16) {
		if (!valid(username)) return Promise.reject(`${username} is an invalid username`);
		const UUID = await getUUID(username)
		const response = await request(`https://api.mojang.com/user/profiles/${UUID}/names`);
		if (response.statusCode !== 200) return Promise.reject(`Response returned statuscode ${response.statusCode}`);
		const r: NameHistory[] = await response.body.json();
		r.forEach(element => nameHistory.set(element.name, element.changedToAt ? Intl.DateTimeFormat("en-GB").format(new Date(element.changedToAt)) : "Original name"));
		return nameHistory;

	} else {
		if (!username.match(/[\d-]/i)) return Promise.reject("Please submit a valid UUID");
		const response = await request(`https://api.mojang.com/user/profiles/${username}/names`);
		if (response.statusCode !== 200) return Promise.reject(`Response returned statuscode ${response.statusCode}`);
		const r: NameHistory[] = await response.body.json();
		r.forEach(element => nameHistory.set(element.name, element.changedToAt ? Intl.DateTimeFormat("en-GB").format(new Date(element.changedToAt)) : "Original name"));
		return nameHistory;
	}
}

function valid(username: string) {
	if (!username.match(/^[a-z0-9_]*$/i)) return false;
	return true;
}