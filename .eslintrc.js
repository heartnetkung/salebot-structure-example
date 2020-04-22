module.exports = {
	extends: "eslint:recommended",
	rules: {
		"no-unused-vars": ["warn"],
		"no-redeclare": ["warn"],
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	ignorePatterns: ["public/"],
	env: {
		es6: true,
		node: true,
		jest: true,
	},
};
