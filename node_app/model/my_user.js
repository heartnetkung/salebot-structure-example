const { getPool } = require("../../shared/mssql/connection_pool");

const selectFromUsername = async (username) => {
	var SQL = "SELECT * FROM MyUser";
	var pool = await getPool("db1");
	var result = await pool.query(SQL);
	return result.recordset;
};

module.exports = { selectFromUsername };
