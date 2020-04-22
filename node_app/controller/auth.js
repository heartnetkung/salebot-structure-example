const scrypt = require("../../shared/facade/scrypt");
const myUserModel = require("../model/my_user");

const login = async (req, res) => {
	var { username, password } = req.query;
	var users = await myUserModel.selectFromUsername(username);
	if (!users.length)
		return res.status(400).json({ error: "username or password is incorrect" });

	var success = await scrypt.verifyPassword(password, users[0].password);
	if (!success)
		return res.status(400).json({ error: "username or password is incorrect" });

	req.session.username = username;
	res.json({});
};

const logout = async (req, res) => {
	req.session = null;
	res.json({});
};

module.exports = { login, logout };
