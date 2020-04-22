const express = require("express");
const supertest = require("supertest");
require("express-async-errors");

var stack = [];

const test = async (controller, status, target) => {
	stack = [];
	var router = express.Router().get("/", controller);
	var app = express()
		.use((req, res, next) => {
			stack.push("A1");
			next();
			stack.push("A2");
		})
		.use(router)
		.use((req, res, next) => {
			stack.push("B1");
			next();
			stack.push("B2");
		})
		.use((err, req, res, next) => {
			stack.push("error");
			res.status(500).send("");
		});
	var res = await supertest(app).get("/");
	expect(res.status).toBe(status);
	expect(stack).toEqual(target);
};

const asyncTimer = () => new Promise((res, rej) => setTimeout(res, 100));
const perform = (res) => {
	stack.push("perform");
	res.send("perform");
};

describe("express-async-errors facade", () => {
	it("should handle normal case", async () => {
		var controller = (req, res) => perform(res);
		await test(controller, 200, ["A1", "perform", "A2"]);
	});
	it("should handle timer case", async () => {
		var controller = (req, res) => setTimeout(() => perform(res), 100);
		await test(controller, 200, ["A1", "A2", "perform"]);
	});
	it("should handle async case", async () => {
		var controller = async (req, res) => perform(res);
		await test(controller, 200, ["A1", "perform", "A2"]);
	});
	it("should handle async timer case", async () => {
		var controller = async (req, res) => {
			await asyncTimer();
			perform(res);
		};
		await test(controller, 200, ["A1", "A2", "perform"]);
	});
	it("should handle error case", async () => {
		var controller = (req, res) => {
			throw new Error("hello");
		};
		await test(controller, 500, ["A1", "A2", "error"]);
	});
	// ===== error timer case is a bad practice and cannot be tested
	it("should handle async error case", async () => {
		var controller = async (req, res) => {
			throw new Error("hello");
		};
		await test(controller, 500, ["A1", "A2", "error"]);
	});
	it("should handle async timer error case", async () => {
		var controller = async (req, res) => {
			await asyncTimer();
			throw new Error("hello");
		};
		await test(controller, 500, ["A1", "A2", "error"]);
	});
});
