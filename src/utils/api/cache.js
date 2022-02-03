class Cache {
	/**
	 * @param {Number} defaultCacheTime The default cache time 
	 */
	constructor(defaultCacheTime = 600000) {
		if (typeof defaultCacheTime !== "number") throw new Error(`defaultCacheTime must be a number`)
		this.defaultCacheTime = defaultCacheTime
	}

	#cache = {}

	/**
	 * Add a value to the cache
	 * @param {any} key The key of the cache
	 * @param {any} value The value bound to the key
	 * @param {Number} [expiration=600000] The expiration time in MS
	 * @returns {object} The cached object
	 */
	set(key, value, expiration = this.defaultCacheTime) {
		if (!key || !value) throw new Error(`Missing parameters`)
		if (this.#cache[key]) throw new Error(`Key already exists`)
		expiration += Date.now()
		this.#cache[key] = { value, expiration }
		return this.#cache[key]
	}

	/**
	 * Get a value from the cache
	 * @param {any} key The key of the value you want to retrieve 
	 * @param {boolean} unreduced If true, the entire object will be returned instead of just the value 
	 * @returns {any|object|null} Returns either the cached value, full object, or NULL if the object expired or doesn't exist
	 */
	get(key, unreduced = false) {
		if (!key) throw new Error("Missing: \"Key\"")
		const cached = this.#cache[key]
		if (!cached) return null
		if (Date.now() > cached.expiration) {
			delete this.#cache[key]
			return null;
		}
		return unreduced ? cached : cached.value
	}

	/**
	 * Delete a value from the cache
	 * @param {any} key The key of the value you want to delete
	 * @returns {object|null} Returns the deleted object or NULL if the object doesn't exist
	 */
	delete(key) {
		if (!key) throw new Error("Missing: \"Key\"")
		const cached = this.#cache[key]
		delete this.#cache[key]
		return cached || null
	}

	/**
	 * Clear the entire cache
	 * @returns {object} The cache object
	 */
	clear() {
		const cache = this.#cache
		this.#cache = {}
		return cache
	}

	/**
	 * Returns the entire cache
	 * @returns {object} The cache object
	 */
	all() {
		return this.#cache
	}
}
module.exports = Cache