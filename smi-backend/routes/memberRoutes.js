// routes/memberRoutes.js

const express = require("express");

const {
  getMembers,
  addMember,
} = require("../controllers/memberController");

const router = express.Router();

router.get("/", getMembers);
router.post("/", addMember);

module.exports = router;