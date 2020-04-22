require("../config_env");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const connectionPool = require("../shared/mssql/connection_pool");

const OUTPUT = path.join(__dirname, "../schema_dump.txt");

const sortKeys = (a) => {
	var ans = {};
	for (var x of _.keys(a).sort()) ans[x] = a[x];
	return ans;
};

const printColumnNames = async (pool, lines) => {
	const SQL = `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
			FROM INFORMATION_SCHEMA.COLUMNS`;
	var ans = await pool.query(SQL);
	ans = sortKeys(_.groupBy(ans.recordset, "TABLE_NAME"));
	for (var x in ans) {
		lines.push("  " + x);
		for (var y of _.sortBy(ans[x], "COLUMN_NAME"))
			lines.push(
				[
					"   ",
					y["COLUMN_NAME"],
					y["DATA_TYPE"],
					y["IS_NULLABLE"] === "YES" ? "nullable" : "",
				].join(" ")
			);
	}
};

if (require.main === module)
	(async () => {
		try {
			var lines = [];
			for (var dbName in connectionPool.ALL_CONFIG) {
				lines.push(dbName);
				var pool = await connectionPool.getPool(dbName);
				await printColumnNames(pool, lines);
			}
			fs.writeFileSync(OUTPUT, lines.join("\n"));
		} catch (e) {
			console.error(e);
		}
		await connectionPool.closeAll();
	})();
