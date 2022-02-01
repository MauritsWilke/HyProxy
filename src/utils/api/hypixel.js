const fetch = require('node-fetch');
const { getUUID, getUsername } = require('./mojang.js');
const { join } = require("path")
let { apiKey } = require(join(process.cwd(), "./HyProxyConfig.json"))
const Cache = require("./cache")

const BASE_KEY = "https://api.hypixel.net"

let uuidCache = new Cache(0);
let flCache = new Cache(0);
let playerGuildCache = new Cache(0);

module.exports = {
	keyInfo,
	playerStats,
	friendList,
	recentGames,
	playerStatus,
	playerGuild,
	guildData,
	getActiveBoosters,
	playerCounts,
	getPunishments,
	clearCache,
	setKey
}

function setKey(key) {
	apiKey = key;
}

async function keyInfo(key) {
	const response = await fetch(`${BASE_KEY}/key?&key=${key || apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const r = await response.json();
	return r.record;
}

async function playerStats(player, gamemode) {
	if (!player) return Promise.reject(`This function requires an input`);
	const UUID = player.length <= 16 ? uuidCache.get(player) || await getUUID(player).then(r => uuidCache.set(player, r).value) : player;
	const response = await fetch(`${BASE_KEY}/player?uuid=${UUID}&key=${apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const json = await response.json();
	return gamemode ? json.player.stats[gamemode] : json.player;
}

async function friendList(player) {
	if (!player) return Promise.reject(`This function requires an input`);
	const friends = flCache.get(player) || await getFriendList(player);
	return friends
}

async function recentGames(player) {
	if (!player) return Promise.reject(`This function requires an input`);
	const UUID = player.length <= 16 ? uuidCache.get(player) || await getUUID(player).then(r => uuidCache.set(player, r).value) : player;
	const response = await fetch(`${BASE_KEY}/recentgames?uuid=${UUID}&key=${apiKey}`);
	const r = await response.json();
	return r.games;
}

async function playerStatus(player) {
	if (!player) return Promise.reject(`This function requires an input`);
	const UUID = player.length <= 16 ? uuidCache.get(player) || await getUUID(player).then(r => uuidCache.set(player, r).value) : player;
	const response = await fetch(`${BASE_KEY}/status?uuid=${UUID}&key=${apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const json = await response.json();
	return json.session.online;
}

async function playerGuild(player) {
	if (!player) return Promise.reject(`This function requires an input`);
	const guild = await playerGuildCache.get(player) || getPlayerGuild(player);
	return guild
}

async function guildData(guildName) {
	if (!guildName) return Promise.reject(`This function requires an input`);
	const response = await fetch(`${BASE_KEY}/guild?name=${guildName}&key=${apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const json = await response.json();
	return json.guild;
}

async function getActiveBoosters() {
	activeBoosters = {};
	const response = await fetch(`${BASE_KEY}/boosters?&key=${apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const json = await response.json();
	const boosters = json.boosters;
	for (const boost in boosters) {
		boosters[boost].length < 3600 ? activeBoosters[boost] = boosters[boost] : null;
	}
	return activeBoosters;
}

async function playerCounts() {
	let playerCount = new Map();
	const response = await fetch(`${BASE_KEY}/counts?&key=${apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const json = await response.json();
	const games = json.games;
	playerCount.set("TOTAL", json.playerCount)
	for (const game in games) {
		playerCount.set(game, games[game].players);
	}
	return playerCount;
}

async function getPunishments() {
	const response = await fetch(`${BASE_KEY}/punishmentstats?&key=${apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const json = await response.json();
	return json;
}

async function clearCache() {
	[uuidCache, flCache, playerGuildCache].forEach(cache => cache.clear())
}

// 
// Functions that shouldn't be exported
// 

async function getFriendList(player) {
	let friendList = new Map()
	const UUID = player.length <= 16 ? uuidCache.get(player) || await getUUID(player).then(r => uuidCache.set(player, r).value) : player;
	const response = await fetch(`${BASE_KEY}/friends?uuid=${UUID}&key=${apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const { records } = await response.json();

	for (const friend of records) {
		friendList.set(friend.uuidReceiver === UUID ? await getUsername(friend.uuidSender) : await getUsername(friend.uuidReceiver), Intl.DateTimeFormat('en-GB').format(new Date(friend.started)))
	}
	flCache.set(player, friendList)
	return friendList;
}

async function getPlayerGuild(player) {
	const UUID = player.length <= 16 ? uuidCache.get(player) || await getUUID(player).then(r => uuidCache.set(player, r).value) : player;
	const response = await fetch(`${BASE_KEY}/guild?player=${UUID}&key=${apiKey}`);
	if (!response.ok) return Promise.reject(`${response.status} ${response.statusText}`);
	const json = await response.json();
	playerGuildCache.set(player, json.guild.name);
	return json.guild.name;
}