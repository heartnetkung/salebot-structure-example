const { getPool } = require("../../shared/mssql/connection_pool");
const sql = require("mssql");
const _ = require("lodash");

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

const insertUser = async (username, hashedPassword) => {
	var SQL =
		"INSERT INTO my_user (username, password) VALUES (@username, @password)";
	var pool = await getPool("db1");
	try {
		return await pool
			.request()
			.input("username", username)
			.input("password", hashedPassword)
			.query(SQL);
	} catch (e) {
		if (/duplicate/.test(_.get(e, "originalError.info.message")))
			throw new Error("duplicate");
		throw e;
	}
};

module.exports = { selectFromUsername, insertUser };
