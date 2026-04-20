// This router handles the root path and redirects to the main marketplace page.
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/index.html");
});

module.exports = router;
