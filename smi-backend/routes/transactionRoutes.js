// routes/transactionRoutes.js

const express = require("express");

const {
  getAllTransactions,
  createManualTransaction,
  importCurrentBalances,
  rebuildTransactionsFromMonthlySnapshots,
  updateTransactionStatus,
  deleteTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/", getAllTransactions);
router.post("/", createManualTransaction);
router.post("/import-current-balances", importCurrentBalances);
router.post("/rebuild-from-monthly", rebuildTransactionsFromMonthlySnapshots);
router.patch("/:id/status", updateTransactionStatus);
router.delete("/:id", deleteTransaction);

module.exports = router;