const { validate, username, password } = require("./ajv");
const Ajv = require("ajv");

describe("ajv", function () {
	describe("validate(schema, obj)", () => {
		it("basic case", function () {
			var schema = {
				properties: { username, password },
				required: ["username", "password"],
			};
			var data = { password: 123 };
			var output = {
				message: "validation failed",
				errors: [
					{
						keyword: "required",
						dataPath: "",
						schemaPath: "#/required",
						params: {
							missingProperty: "username",
						},
						message: "should have required property 'username'",
					},
					{
						keyword: "type",
						dataPath: ".password",
						schemaPath: "#/properties/password/type",
						params: {
							type: "string",
						},
						message: "should be string",
					},
				],
				validation: true,
				ajv: true,
			};
			try {
				validate(schema, data);
			} catch (e) {
				expect(e instanceof Ajv.ValidationError).toBe(true);
				expect(e).toEqual(output);
			}
		});
		it("basic case2", function () {
			var schema = {
				properties: { username, password },
				required: ["username", "password"],
			};
			var data = { username: "1123", password: "12345678" };
			validate(schema, data);
		});
	});
});
