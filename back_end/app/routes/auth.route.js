const express = require("express");
const auth = require("../controllers/auth.controller");

const router = express.Router();

router.route("/register").post(auth.register);
router.route("/login-docgia").post(auth.loginDocGia);
router.route("/login-admin").post(auth.loginAdmin);
router.route("/logout").post(auth.logout);

module.exports = router;
