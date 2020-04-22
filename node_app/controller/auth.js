const scrypt = require("../../shared/facade/scrypt");
const myUserModel = require("../model/my_user");
const { validate, username, password } = require("../../shared/facade/ajv");

const loginSchema = {
	properties: { username, password },
	required: ["username", "password"],
};

const login = async (req, res) => {
	validate(loginSchema, req.query);
	var { username, password } = req.query;
	var users = await myUserModel.selectFromUsername(username);
	if (!users.length)
		return res.status(400).json({ error: "username or password is incorrect" });

	var success = await scrypt.verifyPassword(password, users[0].password);
	if (!success)
		return res.status(400).json({ error: "username or password is incorrect" });

	req.session.username = users[0].username;
	req.session.userId = users[0].id;
	res.json({});
};

const logout = async (req, res) => {
	req.session = null;
	res.json({});
};

const registerSchema = {
	properties: { username, password },
	required: ["username", "password"],
};

const register = async (req, res) => {
	validate(registerSchema, req.query);
	var { username, password } = req.query;
	var hashedPassword = await scrypt.encrypt(password);

	var result;
	try {
		result = await myUserModel.insertUser(username, hashedPassword);
	} catch (e) {
		if (e && e.message === "duplicate")
			return res.status(400).json({ error: "username is taken" });
		throw e;
	}

	var users = await myUserModel.selectFromUsername(username);
	req.session.username = users[0].username;
	req.session.userId = users[0].id;
	res.json({ username, userId: users[0].id });
};

module.exports = { login, logout, register };
