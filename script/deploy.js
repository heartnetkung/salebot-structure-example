const { exec } = require("child_process");
const packageJson = require("../package.json");

const BRANCH = "master";
const DEV_IPS = [];
const PROD_IPS = ["128.199.172.53"];

const runCmd = (cmd) =>
	new Promise((res, rej) => {
		var cb = (err, stdout, stderr) => {
			if (err) {
				err.stdout = stdout + "";
				err.stderr = stderr + "";
				if (err.stderr) console.error(err.stderr);
				return rej(err);
			}
			res(stdout.trim());
		};
		var out = exec(cmd, cb);
		out.stdout.on("data", (data) => console.log(data));
	});

(async () => {
	try {
		var ips = BRANCH === "master" ? PROD_IPS : DEV_IPS;
		for (var ip of ips)
			await runCmd(
				`ssh root@${ip} "cd ${packageJson.name} && git pull origin ${BRANCH} && npm install && npm run production_stop || true && npm run production_start"`
			);
	} catch (e) {
		console.error(e);
	}
})();
