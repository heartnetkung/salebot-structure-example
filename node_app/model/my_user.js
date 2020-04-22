const { getPool } = require("../../shared/mssql/connection_pool");
const sql = require("mssql");

const selectFromUsername = async (username) => {
	var SQL = "SELECT * FROM my_user WHERE username = @username";
	var pool = await getPool("db1");
	var result = await pool
		.request()
		.input("username", sql.VarChar, username)
		.query(SQL);
	//select command return recordset
	return result.recordset;
};

module.exports = { selectFromUsername };
