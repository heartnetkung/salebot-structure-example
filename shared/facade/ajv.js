const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

const cache = new Map();

const validate = (schema, data) => {
	var validate = cache.get(schema);
	if (!validate) cache.set(schema, (validate = ajv.compile(schema)));

	var valid = validate(data);
	if (!valid) throw new Ajv.ValidationError(validate.errors);
};

module.exports = {
	validate,
	username: { type: "string", pattern: "^[a-zA-Z0-9_.\\-]{3,}$" },
	password: { type: "string", pattern: "^[a-zA-Z0-9_.\\-]{8,}$" },
};
