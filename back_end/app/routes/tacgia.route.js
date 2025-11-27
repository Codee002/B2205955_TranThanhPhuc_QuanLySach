const express = require("express");
const tacgia = require("../controllers/tacgia.controller");

const router = express.Router();

router
  .route("/")
  .get(tacgia.findAll)
  .post(tacgia.create)
  .delete(tacgia.deleteAll);

router
  .route("/:id")
  .get(tacgia.findOne)
  .put(tacgia.update)
  .delete(tacgia.delete);

module.exports = router;
