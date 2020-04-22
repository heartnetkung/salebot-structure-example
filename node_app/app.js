require("../config_env");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const glob = require("glob");
const path = require("path");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const httpShutdown = require("http-shutdown");
const errorHandler = require("../shared/middleware/error_handler");
const authHandler = require("../shared/middleware/auth_handler");
// const { logMiddleware } = require("test-stackdriver");
const mssqlConnection = require("../shared/mssql/connection_pool");
const cookieSession = require("cookie-session");
require("express-async-errors");

(async () => {
	// middleware stack
	const app = express();
	app.use(helmet({ dnsPrefetchControl: false }));
	app.use(compression());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cors({ origin: true }));
	app.use(
		cookieSession({
			name: "session",
			secret: process.env.EXPRESS_SESSION_SECRET,
			maxAge: 365 * 24 * 60 * 60 * 1000,
		})
	);
	app.use(logger("dev"));
	app.get("/health", (req, res) => res.send("healthy"));
	app.use(authHandler);

	// if (process.env.NODE_ENV === "production")
	// 	app.use(
	// 		logMiddleware({
	// 			dev: false,
	// 			credentials: {
	// 				type: process.env.GCP_LOGGING_TYPE,
	// 				project_id: process.env.GCP_LOGGING_PROJECT_ID,
	// 				private_key_id: process.env.GCP_LOGGING_PRIVATE_KEY_ID,
	// 				private_key: process.env.GCP_LOGGING_PRIVATE_KEY,
	// 				client_email: process.env.GCP_LOGGING_CLIENT_EMAIL,
	// 				client_id: process.env.GCP_LOGGING_CLIENT_ID,
	// 				auth_uri: process.env.GCP_LOGGING_AUTH_URI,
	// 				token_uri: process.env.GCP_LOGGING_TOKEN_URI,
	// 				auth_provider_x509_cert_url:
	// 					process.env.GCP_LOGGING_AUTH_PROVIDER_X509_CERT_URL,
	// 				client_x509_cert_url: process.env.GCP_LOGGING_CLIENT_X509_CERT_URL
	// 			},
	// 			ignoreRoute: ["/health"]
	// 		})
	// 	);
	// else app.use(logMiddleware({ dev: true }));

	// require all controllers
	for (var file of glob.sync(path.join(__dirname, "/route/*.js")))
		app.use("/" + path.basename(file, ".js"), require(file));

	// error handling
	app.use((req, res, next) =>
		res.status(404).send({ error: "page not found" })
	);
	app.use(errorHandler);

	var server = httpShutdown(app.listen(process.env.EXPRESS_PORT));
	server.on("error", (error) => {
		if (error.syscall !== "listen") throw error;
		if (error.code === "EACCESS") console.error("requires elevated privileges");
		else if (error.code === "EADDRINUSE")
			console.error("port is already in use");
		process.exit(1);
	});

	// graceful shutdown
	var called = false;
	function shutdown() {
		if (called) return;
		called = true;
		server.shutdown(async (err) => {
			try {
				await mssqlConnection.closeAll();
				return process.exit(0);
			} catch (e) {
				err = e;
			}
			console.error(err);
			return process.exit(1);
		});
	}
	process.once("SIGINT", shutdown).once("SIGTERM", shutdown);
})().catch((err) => console.error(err));
