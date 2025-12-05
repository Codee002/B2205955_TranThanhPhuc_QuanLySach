const express = require("express");
const docgia = require("../controllers/docgia.controller");

const router = express.Router();

router.route("/").get(docgia.getAll);

router.route("/:id/status").put(docgia.toggleStatus);
router.route("/me").get(docgia.me);
router.route("/updateProfile").put(docgia.updateProfile);

module.exports = router;
