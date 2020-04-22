const packageJson = require("./package.json");

module.exports = {
	apps: [
		{
			name: packageJson.name,
			script: "./node_app/app.js",
			env: {
				NODE_ENV: "production",
			},
		},
	],
};
