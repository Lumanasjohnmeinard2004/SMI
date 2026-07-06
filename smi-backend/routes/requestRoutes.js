// routes/requestRoutes.js

const express = require("express");

const {
  getMemberRequests,
  createRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Requests route working",
  });
});

router.get("/member/:identifier", getMemberRequests);
router.post("/", createRequest);

module.exports = router;