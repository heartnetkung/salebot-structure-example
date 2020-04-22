require("../../config_env");
const express = require("express");
const bodyParser = require("body-parser");
const errorHandler = require("../middleware/error_handler");
const _ = require("lodash");
const pool = require("../mssql/connection_pool");
require("express-async-errors");

jest.setTimeout(50000);

// middleware stack
module.exports = (controller) =>
	express()
		.use(bodyParser.json())
		.use(bodyParser.urlencoded({ extended: true }))
		.use(mockMiddleware)
		.use(controller)
		.use(errorHandler);

// mock session, cookies
var outSession = null;
var inSession = null;
const mockMiddleware = (req, res, next) => {
	req.session = inSession || {};
	next();
	inSession = null;
	outSession = req.session;
};
module.exports.setSession = (input) => (inSession = input);
module.exports.getSession = () => outSession || {};

afterAll(async () => {
	await pool.closeAll();
});
