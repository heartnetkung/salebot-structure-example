const App = require("./app_test");
const supertest = require("supertest");
const express = require("express");
const _ = require("lodash");

describe("app_test", () => {
	it("should work with hello world route", async () => {
		var controller = express
			.Router()
			.get("/", (req, res) => res.send("helloworld"));
		var result = await supertest(App(controller)).get("/").expect(200);
		expect(result.text).toEqual("helloworld");
	});

	it("can mock session", async () => {
		//mock
		App.setSession({ foo: "s" });

		var controller = express
			.Router()
			.get("/", (req, res) => res.send({ session: req.session }));

		var result = await supertest(App(controller)).get("/").expect(200);
		expect(result.body.session.foo).toBe("s");

		var result2 = await supertest(App(controller)).get("/").expect(200);
		expect(result2.body.session.foo).toBeUndefined();
	});

	it("can handle session destroy", async () => {
		App.setSession({ foo: "s" });
		var controller = express.Router().get("/", (req, res) => {
			req.session = null;
			res.send({});
		});
		var result = await supertest(App(controller)).get("/").expect(200);
		expect(App.getSession().foo).toBeUndefined();
	});

	it("can get cookie, signedCookies, session", async () => {
		var controller = express.Router().get("/", (req, res) => {
			req.session.foo = "s";
			res.send({});
		});

		var result = await supertest(App(controller)).get("/").expect(200);
		expect(App.getSession()).toEqual({ foo: "s" });
	});
});
