require("../../config_env");
const Scrypt = require("scrypt-nonce-wrapper");
const scrypt = new Scrypt({ salt: process.env.PASSWORD_SALT });

// for document see https://github.com/heartnetkung/scrypt-nonce-wrapper
module.exports = scrypt;
