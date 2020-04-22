const scrypt = require("./scrypt");

describe("scrypt", function () {
	describe("encrypt(password) => Promise(string) &nbsp; verifyPassword(password, hash) => Promise(boolean)", () => {
		it("should be different on every encryption", async function () {
			var hash1 = await scrypt.encrypt("hello world");
			var hash2 = await scrypt.encrypt("hello world");
			expect(hash1).not.toEqual(hash2);
		});
		it("should be of length 94", async function () {
			var hash1 = await scrypt.encrypt("hello world ja");
			expect(hash1.length).toBe(94);
		});
		it("should be able to verify", async function () {
			var hash1 = await scrypt.encrypt("hello world ja");
			var verifyResult = await scrypt.verifyPassword("hello world ja", hash1);
			expect(verifyResult).toBe(true);
		});
	});
});
