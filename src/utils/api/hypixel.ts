import { Cache } from "../classes/cache";
import { request } from "undici";
import { getUUID, getUsername } from "./mojang"

const BASE_URL = "https://api.hypixel.net";
let API_KEY: string;

const flCache = new Cache(0);
const playerGuildCache = new Cache(0);

export {
	setKey,
	keyInfo,
	playerStats,
	friendList,
	recentGames,
	playerGuild,
	playerStatus,
	guildData,
	getActiveBoosters,
	playerCounts,
	getPunishments
}

function setKey(key: string) {
	API_KEY = key;
}

async function keyInfo(key?: string) {
	const response = await request(`${BASE_URL}/key?&key=${key || API_KEY}`);
	if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
	const r = await response.body.json();
	return r.record;
}

async function playerStats(player: string, gamemode?: string) {
	const UUID = await getUUID(player);
	const response = await request(`${BASE_URL}/player?uuid=${UUID}&key=${API_KEY}`);
	if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
	const json = await response.body.json();
	return gamemode ? json.player.stats[gamemode] : json.player;
}

async function friendList(player: string) {
	const friends = flCache.get(player);
	if (!friends) {
		const friendList = new Map()
		const UUID = await getUUID(player);
		const response = await request(`${BASE_URL}/friends?uuid=${UUID}&key=${API_KEY}`);
		if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
		const { records } = await response.body.json();
		for (const friend of records) {
			friendList.set(friend.uuidReceiver === UUID ? await getUsername(friend.uuidSender) : await getUsername(friend.uuidReceiver), Intl.DateTimeFormat('en-GB').format(new Date(friend.started)))
		}
		flCache.set(player, friendList)
		return friendList;
	}
	return friends
}

async function recentGames(player: string) {
	const UUID = await getUUID(player);
	const response = await request(`${BASE_URL}/recentgames?uuid=${UUID}&key=${API_KEY}`);
	if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
	const r = await response.body.json();
	return r.games;
}

async function playerStatus(player: string) {
	const UUID = await getUUID(player);
	const response = await request(`${BASE_URL}/status?uuid=${UUID}&key=${API_KEY}`);
	if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
	const json = await response.body.json();
	return json.session.online;
}

async function playerGuild(player: string) {
	const guild = await playerGuildCache.get(player);
	if (!guild) {
		const UUID = await getUUID(player);
		const response = await request(`${BASE_URL}/guild?player=${UUID}&key=${API_KEY}`);
		if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
		const json = await response.body.json();
		playerGuildCache.set(player, json.guild.name);
		return json.guild.name;
	}
	return guild
}

async function guildData(guildName: string) {
	const response = await request(`${BASE_URL}/guild?name=${guildName}&key=${API_KEY}`);
	if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
	const json = await response.body.json();
	return json.guild;
}

async function getActiveBoosters() {
	const activeBoosters = new Map();
	const response = await request(`${BASE_URL}/boosters?&key=${API_KEY}`);
	if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
	const json = await response.body.json();
	const boosters = json.boosters;
	for (const boost in boosters) if (boosters[boost].length < 3600) activeBoosters.set(boost, boosters[boost])
	return activeBoosters;
}

async function playerCounts() {
	const playerCount = new Map();
	const response = await request(`${BASE_URL}/counts?&key=${API_KEY}`);
	if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
	const json = await response.body.json();
	const games = json.games;
	playerCount.set("TOTAL", json.playerCount)
	for (const game in games) {
		playerCount.set(game, games[game].players);
	}
	return playerCount;
}

async function getPunishments() {
	const response = await request(`${BASE_URL}/punishmentstats?&key=${API_KEY}`);
	if (response.statusCode !== 200) return Promise.reject(`${response.statusCode} ${response.body}`);
	const json = await response.body.json();
	delete json.success
	return json;
}