function deepParse(objectlike: any): any {
	if (typeof objectlike === "string") try {
		objectlike = JSON.parse(objectlike)
	} catch (e) {
		throw new Error("Argument must be of type 'object' or of type 'string' with object structure")
	}
	if (typeof objectlike !== 'object') return null;

	Object.entries(objectlike).forEach(
		([key, value]: [any, any]) => {
			try {
				objectlike[key] = JSON.parse(value)
				objectlike[key] = deepParse(objectlike[key])
			} catch (e) { }
		}
	);
	return objectlike
}

export {
	deepParse
}