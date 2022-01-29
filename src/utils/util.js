function fullParse(obj) {
	if (typeof obj === "string") obj = JSON.parse(obj)
	Object.entries(obj).forEach(
		([key, value]) => {
			try {
				obj[key] = JSON.parse(value)
				obj[key] = fullParse(obj[key])
			} catch (e) { }
		}
	);
	return obj
}

module.exports = {
	fullParse
}