require("../../config_env");
const express = require("express");
const bodyParser = require("body-parser");
const errorHandler = require("../middleware/error_handler");
const _ = require("lodash");
const pool = require("../mssql/connection_pool");
const path = require("path");
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

// mock module
module.exports.mockModule = (dirname, modulePath) => {
	var absolutePath = path.join(dirname, modulePath);
	jest.mock(absolutePath);
	var mockObj = require(absolutePath);
	var actualObj = jest.requireActual(absolutePath);

	for (var key in mockObj) {
		var currentFunction = mockObj[key];
		if (jest.isMockFunction(currentFunction))
			currentFunction.mockImplementation(actualObj[key]);
	}

	return mockObj;
};

afterAll(async () => {
	await pool.closeAll();
});
