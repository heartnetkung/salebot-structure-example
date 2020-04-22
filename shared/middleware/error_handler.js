const { ValidationError } = require("ajv");
const IS_PRODUCTION = process.env.NODE_ENV === "production";

module.exports = (err, req, res, next) => {
	if (!IS_PRODUCTION) console.error(err);
	if (req.appendLog) req.appendLog("errorObject", err);
	if (err instanceof ValidationError)
		return res.status(400).json({ error: err.message, data: err.errors });
	res.status(err.status || 500).json({ error: "unhandled" });
};
