const fetch = require('node-fetch');

/**
 * UUID Cache, this caches a UUID for 15 minutes to prevent overloading the Mojang API
 * @type {object}
 */
let uuidCache = {};
/**
 * UUID Cache, this caches the URL to a skin for 15 minutes to prevent overloading the Mojang API
 * @type {object}
 */
let skinCache = {};

module.exports = {
	getUUID,
	getSkin,
	getUsername,
	getNameHistory,
	getOptifineCape,
	clearCache
}

/**
 * Retrieves the UUID of a player.
 * @async
 * @param {string} username 
 * @returns {promise<string>} UUID
 * @example 
 * // Returns a string similair to "11456473de284d36aa7b4150fe7859ab"
 * const playerUUID = await getUUID("I_Like_Cats__");
 */
async function getUUID(username) {
	if (!username) return Promise.reject(`This function requires an input`);
	if (!valid(username)) return Promise.reject(`${username} is an invalid username`);
	if (uuidCache[username]) return uuidCache[username];
	const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
	if (response.status !== 200) return Promise.reject(`${username} does not exist`);
	const json = await response.json();
	uuidCache[username] = json.id;
	setTimeout(() => { delete uuidCache[username] }, 15 * 60000)
	return json.id;
}

/**
 * Retrieves the skin of a player.
 * @async
 * @param {string} username 
 * @returns {string} URL
 * @example 
 * // Returns a URL similair to "http://textures.minecraft.net/texture/8893479f1b0bc4fffe7428a66f5b4dd105003e70b5de5885b885d13814f35337"
 * const playerSkin = await getSkin("I_Like_Cats__");
 */
async function getSkin(username) {
	if (!username) return Promise.reject(`This function requires an input`);
	if (!username.match(/^[a-z0-9_]*$/i)) return Promise.reject(`${username} is an invalid username`);
	if (skinCache[username]) return skinCache[username];
	const UUID = await module.exports.getUUID(username);
	const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${UUID}`);
	if (!response.ok) return Promise.reject(`API Outage`);
	const json = await response.json();
	const r = JSON.parse(Buffer.from(json.properties[0].value, 'base64').toString('ascii'));
	skinCache[username] = r.textures.SKIN.url;
	setTimeout(() => { delete skinCache[username] }, 15 * 60000)
	return r.textures.SKIN.url;
}

/**
 * Retrieves the username of a player.
 * @async
 * @param {string} playerUUID 
 * @returns {promise<string>} username
 * @example 
 * // Returns "I_Like_Cats__" 
 * const playerUsername = await getUsername("11456473de284d36aa7b4150fe7859ab");
 */
async function getUsername(playerUUID) {
	if (!playerUUID) return Promise.reject(`This function requires an input`);
	if (!playerUUID.match(/[\d-]/i)) return Promise.reject(`Please submit a valid UUID`);
	const response = await fetch(`https://api.mojang.com/user/profiles/${playerUUID}/names`);
	if (!response.ok) return Promise.reject(`API Outage`);
	const json = await response.json();
	return json[json.length - 1].name;
}

/**
 * Retrieves the name history of a player.
 * Takes both UUID and Username.
 * @async
 * @param {string} player
 * @returns {Map} 'Username' => 'Changed at'
 * @example 
 * // Returns "Map(1) { 'I_Like_Cats__' => 'Original name' }" 
 * const nameHistory = await getNameHistory("11456473de284d36aa7b4150fe7859ab");
 */
async function getNameHistory(player) {
	if (!player) return Promise.reject(`This function requires an input`);
	let nameHistory = new Map();
	if (player.length <= 16) {
		if (!valid(username)) return Promise.reject(`${player} is an invalid username`);
		const UUID = await module.exports.getUUID(player);
		const response = await fetch(`https://api.mojang.com/user/profiles/${UUID}/names`);
		if (!response.ok) return Promise.reject(`API Outage`);
		const r = await response.json();
		r.forEach(element => nameHistory.set(element.name, element.changedToAt ? Intl.DateTimeFormat('en-GB').format(new Date(element.changedToAt)) : "Original name"));
		return nameHistory;

	} else {
		if (!player.match(/[\d-]/i)) return Promise.reject(`Please submit a valid UUID`);
		const response = await fetch(`https://api.mojang.com/user/profiles/${player}/names`);
		if (!response.ok) return Promise.reject(`API Outage`);
		const r = await response.json();
		r.forEach(element => nameHistory.set(element.name, element.changedToAt ? Intl.DateTimeFormat('en-GB').format(new Date(element.changedToAt)) : "Original name"));
		return nameHistory;
	}
}

/**
 * Retrieves the optifine cape of a player.
 * @async
 * @param {string} username
 * @returns {string} url to cape
 * @example 
 * // Returns "http://s.optifine.net/capes/I_Like_Cats__.png"
 * const cape = await getOptifineCape("I_Like_Cats__");
 */
async function getOptifineCape(username) {
	if (!username) return Promise.reject(`This function requires an input`);
	if (!valid(username)) return Promise.reject(`${username} is an invalid username`);
	return `http://s.optifine.net/capes/${username}.png`
}

function clearCache() {
	uuidCache = {};
	skinCache = {};
}

function valid(username) {
	if (!username.match(/^[a-z0-9_]*$/i)) return false;
	return true;
}