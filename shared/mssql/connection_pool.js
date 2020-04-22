const sql = require("mssql");

const ALL_CONFIG = {
	db1: {
		user: process.env.DB1_USER,
		password: process.env.DB1_PASS,
		server: process.env.DB1_SERVER,
		database: process.env.DB1_DATABASE,
		options: { enableArithAbort: true },
	},
};

const allDb = {};

const getPool = async (dbName) => {
	if (!allDb[dbName]) {
		allDb[dbName] = new sql.ConnectionPool(ALL_CONFIG[dbName]);
		await allDb[dbName].connect();
	}
	return allDb[dbName];
};

const closeAll = async () => {
	var promises = [];
	for (var dbName in allDb) promises.push(allDb[dbName].close());
	await Promise.all(promises);
};

module.exports = {
	getPool,
	closeAll,
	ALL_CONFIG,
};
