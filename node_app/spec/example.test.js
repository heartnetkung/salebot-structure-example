const App = require("../../shared/testing/app_test");
const myUser = App.mockModule(__dirname, "../../node_app/model/my_user");
const req = require("supertest");
const route = require("../route/v1_3");

describe("/example/add", () => {
	it("basic case", async () => {
		var res = await req(App(route)).get("/example/add?number=1").expect(200);
		expect(res.body.ans).toEqual(2);
	});
	it("error case", async () => {
		var res = await req(App(route)).get("/example/add?number=a").expect(400);
		expect(res.body.error).toEqual("not an integer");
	});
});

describe("/example/get_user", () => {
	it("basic case", async () => {
		var res = await req(App(route))
			.get("/example/get_user?username=tor")
			.expect(200);
		expect(res.body.username).toEqual("tor");
		expect(typeof res.body.password).toBe("string");
	});
	it("400 user not found", async () => {
		myUser.selectFromUsername.mockImplementationOnce(async () => []);
		var res = await req(App(route))
			.get("/example/get_user?username=tor")
			.expect(400);
		expect(res.body.error).toEqual("user not found");
	});
});

describe("/example/error", () => {
	it("basic case", async () => {
		// comment to not spam terminal
		// var res = await req(App(route)).get("/example/error").expect(500);
		// expect(res.body.error).toEqual("unhandled");
	});
});
