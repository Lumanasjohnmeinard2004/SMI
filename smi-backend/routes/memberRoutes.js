// routes/memberRoutes.js

const express = require("express");

const {
  getMembers,
  addMember,
  saveManualFinancialRecord,
  getMemberFinancials,
} = require("../controllers/memberController");

const router = express.Router();

router.get("/", getMembers);
router.post("/", addMember);
router.post("/manual-financial-record", saveManualFinancialRecord);
router.get("/:identifier/financials", getMemberFinancials);

module.exports = router;