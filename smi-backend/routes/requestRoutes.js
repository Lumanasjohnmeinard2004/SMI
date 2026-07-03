// routes/requestRoutes.js

const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Requests route working",
  });
});

module.exports = router;