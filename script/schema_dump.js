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

const makeKey = (a) =>
	[a.TABLE_SCHEMA, a.TABLE_CATALOG, a.TABLE_NAME].join("|");

const getColumnNames = async (pool) => {
	const SQL = `
SELECT	TABLE_SCHEMA, TABLE_CATALOG, TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM	INFORMATION_SCHEMA.COLUMNS`;
	var ans = await pool.query(SQL);
	return _.groupBy(ans.recordset, makeKey);
};

const getConstraints = async (pool) => {
	const SQL = `
SELECT	k.TABLE_SCHEMA, k.TABLE_CATALOG, k.TABLE_NAME, k.COLUMN_NAME, c.CONSTRAINT_TYPE, k.CONSTRAINT_NAME
FROM	INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS c
JOIN	INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS k ON c.TABLE_NAME = k.TABLE_NAME
			AND c.CONSTRAINT_CATALOG = k.CONSTRAINT_CATALOG
			AND c.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
			AND c.CONSTRAINT_NAME = k.CONSTRAINT_NAME`;
	var ans = await pool.query(SQL);
	var ans2 = _.groupBy(ans.recordset, makeKey);
	for (var x in ans2) {
		var temp = (ans2[x] = _.groupBy(ans2[x], "COLUMN_NAME"));
		for (var y in temp)
			temp[y] = temp[y].map((a) => a.CONSTRAINT_TYPE).join("  ");
	}
	return ans2;
};

const makeString = async (pool, lines) => {
	var [columns, constraints] = await Promise.all([
		getColumnNames(pool),
		getConstraints(pool),
	]);

	for (var key in sortKeys(columns)) {
		lines.push("  " + key.split("|").pop());
		var constraint = constraints[key];

		for (var column of _.sortBy(columns[key], "COLUMN_NAME")) {
			var parts = ["  ", column["COLUMN_NAME"], column["DATA_TYPE"]];
			if (column["IS_NULLABLE"] === "YES") parts.push("nullable");
			if (constraint && constraint[column["COLUMN_NAME"]])
				parts.push(constraint[column["COLUMN_NAME"]]);
			lines.push(parts.join("  "));
		}
	}
};

if (require.main === module)
	(async () => {
		try {
			var lines = [];
			for (var dbName in connectionPool.ALL_CONFIG) {
				lines.push(dbName);
				var pool = await connectionPool.getPool(dbName);
				await makeString(pool, lines);
			}
			fs.writeFileSync(OUTPUT, lines.join("\n"));
		} catch (e) {
			console.error(e);
		}
		await connectionPool.closeAll();
	})();
