const express = require("express");
const docgia = require("../controllers/docgia.controller");

const router = express.Router();

router.route("/").get(docgia.getAll);

router.route("/:id/status").put(docgia.toggleStatus);

module.exports = router;
