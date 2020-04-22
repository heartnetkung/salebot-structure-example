const NO_LOGIN_ROUTE = new Set(["login", "logout", "register"]);

const checkLogin = (req, res, next) => {
	//use userId instead in real code
	var userSession = req.session.username;
	var path = req.path.split("/").pop();
	if (!NO_LOGIN_ROUTE.has(path) && !userSession)
		return res.status(401).json({ error: "login required" });

	if (req.appendLog) req.appendLog("username", req.session.username);
	next();
};

module.exports = checkLogin;
