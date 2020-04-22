const App = require("../../shared/testing/app_test");
jest.mock("../../node_app/model/my_user");
const myUser = require("../../node_app/model/my_user");
const _myUser = jest.requireActual("../../node_app/model/my_user");
const req = require("supertest");
const route = require("../route/v1_3");

describe("/auth/login", () => {
	it("basic case", async () => {
		myUser.selectFromUsername.mockImplementationOnce(
			_myUser.selectFromUsername
		);
		var res = await req(App(route))
			.get("/auth/login?username=tor&password=12345678")
			.expect(200);
		expect(App.getSession().userId).toBe(1);
		expect(App.getSession().username).toBe("tor");
	});

	it("incorrect password, return 400 'username or password is incorrect'", async () => {
		myUser.selectFromUsername.mockImplementationOnce(async () => [
			{ username: "tor", password: "foo" },
		]);
		var res = await req(App(route))
			.get("/auth/login?username=tor&password=xxx")
			.expect(400);
		expect(res.body.error).toBe("username or password is incorrect");
	});

	it("username not found, return 400 'username or password is incorrect'", async () => {
		myUser.selectFromUsername.mockImplementationOnce(async () => []);
		var res = await req(App(route))
			.get("/auth/login?username=noone&password=noone")
			.expect(400);
		expect(res.body.error).toBe("username or password is incorrect");
	});
});

describe("/auth/logout", () => {
	it("basic case", async () => {
		App.setSession({ username: "tor", userId: 1 });
		var res = await req(App(route)).get("/auth/logout").expect(200);
		expect(App.getSession().username).toBeUndefined();
		expect(App.getSession().userId).toBeUndefined();
	});
});

describe("/auth/register", () => {
	it("basic case", async () => {
		myUser.insertUser.mockImplementationOnce(async () => []);
		myUser.selectFromUsername.mockImplementationOnce(async () => [
			{ username: "abc", id: 2, password: "xxx" },
		]);
		var res = await req(App(route))
			.get("/auth/register?username=abc&password=123")
			.expect(200);
		expect(res.body.username).toBe("abc");
		expect(typeof res.body.userId).toBe("number");
		expect(App.getSession().username).toBe("abc");
		expect(typeof App.getSession().userId).toBe("number");
	});

	it("return 400 'username is taken'", async () => {
		myUser.insertUser.mockImplementationOnce(_myUser.insertUser);
		myUser.selectFromUsername.mockImplementationOnce(
			_myUser.selectFromUsername
		);
		var res = await req(App(route))
			.get("/auth/register?username=tor&password=123")
			.expect(400);
		expect(res.body.error).toBe("username is taken");
	});
});
