const auth = require("../controller/auth");
const example = require("../controller/example");
const express = require("express");
const router = (module.exports = express.Router());

router.get("/example/add", example.add);
router.get("/example/get_user", example.getUser);
router.get("/example/error", example.error);

//use get as it's easier to demo
router.get("/auth/login", auth.login);
router.get("/auth/logout", auth.logout);
