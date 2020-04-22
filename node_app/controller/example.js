const myUserModel = require("../model/my_user");

const add = async (req, res) => {
	var int = parseInt(req.query.number);
	if (isNaN(int)) return res.status(400).json({ error: "not an integer" });

	res.json({ ans: int + 1 });
};

const getUser = async (req, res) => {
	var ans = await myUserModel.selectFromUsername(req.query.username);
	if (!ans.length) return res.status(400).send({ error: "user not found" });
	res.json(ans[0]);
};

const error = async (req, res) => {
	throw new Error("something bad");
};

module.exports = { add, getUser, error };
