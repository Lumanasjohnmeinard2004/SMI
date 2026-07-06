// routes/requestRoutes.js

const express = require("express");

const {
  getAllRequests,
  getMemberRequests,
  createRequest,
  updateRequestStatus,
} = require("../controllers/requestController");

const router = express.Router();

router.get("/", getAllRequests);
router.get("/member/:identifier", getMemberRequests);
router.post("/", createRequest);
router.patch("/:id/status", updateRequestStatus);

module.exports = router;