require("../../config_env");
const { getPool } = require("./connection_pool");

const SQL = "SELECT 1";

(async () => {
	var pool;
	try {
		pool = await getPool("db1");
		const result = await pool.query(SQL);
		console.log(result);
		pool.close();
	} catch (e) {
		console.error(e);
		if (pool) pool.close();
	}
})();
