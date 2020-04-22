const dotenv = require("dotenv");
const path = require("path");

dotenv.config({});
dotenv.config({ path: path.join(__dirname, ".env.default") });

if (new Date().getTimezoneOffset() !== -420)
	throw new Error("Incorrect OS Timezone");
