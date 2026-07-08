// routes/memberRoutes.js

const express = require("express");

const {
  getMembers,
  addMember,
  saveManualFinancialRecord,
  importExcelFinancialRecords,
  updateMemberFinancialRecord,
  getMemberFinancials,
  getMemberMonthlyFinancials,
  updateMemberProfileImage,
} = require("../controllers/memberController");

const router = express.Router();

router.get("/", getMembers);
router.post("/", addMember);
router.post("/manual-financial-record", saveManualFinancialRecord);
router.post("/import-excel-records", importExcelFinancialRecords);
router.patch("/:identifier/financials", updateMemberFinancialRecord);
router.get("/:identifier/monthly-financials", getMemberMonthlyFinancials);
router.patch("/:identifier/profile-image", updateMemberProfileImage);
router.get("/:identifier/financials", getMemberFinancials);

module.exports = router;