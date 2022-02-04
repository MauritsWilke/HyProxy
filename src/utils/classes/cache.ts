type Cached = {
	value: any;
	expiration: number
}

export class Cache extends Map {
	constructor(public defaultCacheTime: number = 600000) {
		super();
	}

	set(key: any, value: any, expiration: number = this.defaultCacheTime) {
		expiration += Date.now()
		super.set(key, { value, expiration })
		return super.get(key)
	}

	get(key: any, unreduced: boolean = false): Cached | null | any {
		const cache = super.get(key);
		if (!cache) return null
		if (Date.now() > cache.expiration) {
			super.delete(key);
			return null;
		}
		return unreduced ? cache : cache.value
	}

	delete(key: any) {
		const cached = super.get(key);
		const del = super.delete(key);
		return del ? cached : null
	}
}