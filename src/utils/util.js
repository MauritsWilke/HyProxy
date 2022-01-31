function deepParse(obj) {
	if (typeof obj === "string") try {
		obj = JSON.parse(obj)
	} catch (e) {
		throw new Error("Argument must be of type 'object' or of type 'string' with object structure")
	}
	Object.entries(obj).forEach(
		([key, value]) => {
			try {
				obj[key] = JSON.parse(value)
				obj[key] = deepParse(obj[key])
			} catch (e) { }
		}
	);
	return obj
}

module.exports = {
	deepParse
}