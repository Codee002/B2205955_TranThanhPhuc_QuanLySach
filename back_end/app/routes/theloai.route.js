const express = require("express");
const theloai = require("../controllers/theloai.controller");

const router = express.Router();

router
  .route("/")
  .get(theloai.findAll)
  .post(theloai.create)
  .delete(theloai.deleteAll);

router
  .route("/:id")
  .get(theloai.findOne)
  .put(theloai.update)
  .delete(theloai.delete);

module.exports = router;
