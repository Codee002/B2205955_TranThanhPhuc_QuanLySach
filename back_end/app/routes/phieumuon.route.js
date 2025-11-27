const express = require("express");
const phieumuon = require("../controllers/phieumuon.controller");

const router = express.Router();

router.route("/").post(phieumuon.create);
router.route("/createFormAdmin").post(phieumuon.createFormAdmin);
router.route("/").get(phieumuon.findAll);
router.route("/getBorrowStats").get(phieumuon.getBorrowStats);
router.route("/my").get(phieumuon.getMyBorrows);
router.route("/:id").get(phieumuon.findOne);

router.patch("/:id/approve", phieumuon.approve);
router.patch("/:id/cancel", phieumuon.cancel);
router.patch("/:id/reject", phieumuon.reject);
router.patch("/:id/return", phieumuon.return);

module.exports = router;
