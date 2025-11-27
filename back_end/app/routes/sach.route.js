const express = require("express");
const sach = require("../controllers/sach.controller");

const router = express.Router();

router.route("/").get(sach.findAll).post(sach.create).delete(sach.deleteAll);
router.route("/:id").get(sach.findOne).put(sach.update).delete(sach.delete);
router.route("/:id/toggle-status").patch(sach.toggleStatus);
module.exports = router;
