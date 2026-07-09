// controllers/transactionController.js

const pool = require("../db");

function toNumber(value) {
  const parsed = Number(String(value || "").replace(/,/g, "").trim());

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function cleanMonth(value) {
  if (!value) {
    return getCurrentMonth();
  }

  const cleaned = String(value).trim();

  if (!/^\d{4}-\d{2}$/.test(cleaned)) {
    return getCurrentMonth();
  }

  return cleaned;
}

const BALANCE_FIELDS = [
  {
    key: "share_capital",
    label: "Share Capital",
    importType: "Share Capital Current Balance",
    increaseType: "Share Capital Contribution",
    decreaseType: "Share Capital Adjustment",
  },
  {
    key: "savings",
    label: "Savings",
    importType: "Savings Current Balance",
    increaseType: "Savings Deposit",
    decreaseType: "Savings Withdrawal",
  },
  {
    key: "special_savings",
    label: "Special Savings",
    importType: "Special Savings Current Balance",
    increaseType: "Special Savings Deposit",
    decreaseType: "Special Savings Withdrawal",
  },
  {
    key: "dividend_amount",
    label: "Dividend",
    importType: "Dividend Current Balance",
    increaseType: "Dividend Earned",
    decreaseType: "Dividend Payout",
  },
  {
    key: "regular_loan",
    label: "Regular Loan",
    importType: "Regular Loan Current Balance",
    increaseType: "Regular Loan Release",
    decreaseType: "Regular Loan Payment",
  },
  {
    key: "regular_loan_diminishing",
    label: "Regular Loan Diminishing",
    importType: "Regular Loan Diminishing Current Balance",
    increaseType: "Regular Loan Diminishing Release",
    decreaseType: "Regular Loan Diminishing Payment",
  },
  {
    key: "educational_loan",
    label: "Educational Loan",
    importType: "Educational Loan Current Balance",
    increaseType: "Educational Loan Release",
    decreaseType: "Educational Loan Payment",
  },
  {
    key: "educational_loan_diminishing",
    label: "Educational Loan Diminishing",
    importType: "Educational Loan Diminishing Current Balance",
    increaseType: "Educational Loan Diminishing Release",
    decreaseType: "Educational Loan Diminishing Payment",
  },
  {
    key: "short_term_loan",
    label: "Short Term Loan",
    importType: "Short Term Loan Current Balance",
    increaseType: "Short Term Loan Release",
    decreaseType: "Short Term Loan Payment",
  },
  {
    key: "short_term_loan_diminishing",
    label: "Short Term Loan Diminishing",
    importType: "Short Term Loan Diminishing Current Balance",
    increaseType: "Short Term Loan Diminishing Release",
    decreaseType: "Short Term Loan Diminishing Payment",
  },
  {
    key: "appliance_loan",
    label: "Appliance Loan",
    importType: "Appliance Loan Current Balance",
    increaseType: "Appliance Loan Release",
    decreaseType: "Appliance Loan Payment",
  },
  {
    key: "appliance_loan_diminishing",
    label: "Appliance Loan Diminishing",
    importType: "Appliance Loan Diminishing Current Balance",
    increaseType: "Appliance Loan Diminishing Release",
    decreaseType: "Appliance Loan Diminishing Payment",
  },
  {
    key: "medical_loan",
    label: "Medical Loan",
    importType: "Medical Loan Current Balance",
    increaseType: "Medical Loan Release",
    decreaseType: "Medical Loan Payment",
  },
  {
    key: "medical_loan_diminishing",
    label: "Medical Loan Diminishing",
    importType: "Medical Loan Diminishing Current Balance",
    increaseType: "Medical Loan Diminishing Release",
    decreaseType: "Medical Loan Diminishing Payment",
  },
  {
    key: "petty_cash_loan",
    label: "Petty Cash Loan",
    importType: "Petty Cash Loan Current Balance",
    increaseType: "Petty Cash Loan Release",
    decreaseType: "Petty Cash Loan Payment",
  },
  {
    key: "vehicle_loan",
    label: "Vehicle Loan",
    importType: "Vehicle Loan Current Balance",
    increaseType: "Vehicle Loan Release",
    decreaseType: "Vehicle Loan Payment",
  },
  {
    key: "inter_trading_loan",
    label: "Inter Trading Loan",
    importType: "Inter Trading Loan Current Balance",
    increaseType: "Inter Trading Loan Release",
    decreaseType: "Inter Trading Loan Payment",
  },
];

function getBalanceFieldConfig(key) {
  return BALANCE_FIELDS.find((field) => field.key === key) || null;
}

function createTransactionCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(100000 + Math.random() * 900000);

  return `TXN-${datePart}-${randomPart}`;
}

function createReferenceNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `SMI-REF-${datePart}-${randomPart}`;
}

function getTransactionDateFromMonth(recordMonth) {
  const month = cleanMonth(recordMonth);
  return `${month}-01T00:00:00.000Z`;
}

async function ensureTransactionsTable(client = pool) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS member_transactions (
      id SERIAL PRIMARY KEY,
      transaction_code VARCHAR(100) UNIQUE NOT NULL,
      reference_no VARCHAR(100) NOT NULL,

      member_db_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      member_code VARCHAR(100),
      username VARCHAR(100),
      member_name TEXT,

      transaction_type VARCHAR(150) NOT NULL,
      amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
      direction VARCHAR(20) NOT NULL DEFAULT 'credit',
      status VARCHAR(50) NOT NULL DEFAULT 'Completed',

      source VARCHAR(100) NOT NULL DEFAULT 'System',
      source_id VARCHAR(100),
      request_id INTEGER,

      balance_field VARCHAR(100),
      balance_before NUMERIC(14, 2),
      balance_after NUMERIC(14, 2),

      record_month VARCHAR(7),
      remarks TEXT,

      is_imported_balance BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_member_transactions_member_db_id
    ON member_transactions(member_db_id)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_member_transactions_member_code
    ON member_transactions(member_code)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_member_transactions_username
    ON member_transactions(username)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_member_transactions_record_month
    ON member_transactions(record_month)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_member_transactions_balance_field
    ON member_transactions(balance_field)
  `);
}

function getMemberDbId(member) {
  return member?.id || member?.member_db_id || member?.member_id_internal || null;
}

function getMemberCode(member) {
  return member?.member_code || member?.member_id || "";
}

function getMemberName(member) {
  return member?.member_name || member?.full_name || member?.name || "";
}

async function createTransactionRecord(data, client = pool) {
  await ensureTransactionsTable(client);

  const result = await client.query(
    `
    INSERT INTO member_transactions (
      transaction_code,
      reference_no,

      member_db_id,
      member_code,
      username,
      member_name,

      transaction_type,
      amount,
      direction,
      status,

      source,
      source_id,
      request_id,

      balance_field,
      balance_before,
      balance_after,

      record_month,
      remarks,
      is_imported_balance,
      created_at,
      updated_at
    )
    VALUES (
      $1, $2,
      $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13,
      $14, $15, $16,
      $17, $18, $19,
      COALESCE($20::timestamp, CURRENT_TIMESTAMP),
      CURRENT_TIMESTAMP
    )
    RETURNING *
    `,
    [
      data.transaction_code || createTransactionCode(),
      data.reference_no || createReferenceNumber(),

      data.member_db_id || getMemberDbId(data.member),
      data.member_code || getMemberCode(data.member),
      data.username || data.member?.username || "",
      data.member_name || getMemberName(data.member),

      data.transaction_type || data.type || "Transaction",
      toNumber(data.amount),
      data.direction || "credit",
      data.status || "Completed",

      data.source || "System",
      data.source_id || null,
      data.request_id || null,

      data.balance_field || null,
      data.balance_before === undefined ? null : toNumber(data.balance_before),
      data.balance_after === undefined ? null : toNumber(data.balance_after),

      data.record_month || null,
      data.remarks || "No remarks",
      Boolean(data.is_imported_balance),
      data.transaction_date || null,
    ]
  );

  return result.rows[0];
}

async function hasExistingImportedTransaction({
  memberDbId,
  balanceField,
  source,
  recordMonth,
  requestId,
  client = pool,
}) {
  await ensureTransactionsTable(client);

  const conditions = [
    "member_db_id = $1",
    "balance_field = $2",
    "source = $3",
  ];

  const values = [memberDbId, balanceField, source];

  if (recordMonth) {
    values.push(recordMonth);
    conditions.push(`record_month = $${values.length}`);
  }

  if (requestId) {
    values.push(String(requestId));
    conditions.push(`source_id = $${values.length}`);
  }

  const result = await client.query(
    `
    SELECT id
    FROM member_transactions
    WHERE ${conditions.join(" AND ")}
    LIMIT 1
    `,
    values
  );

  return result.rows.length > 0;
}

async function recordBalanceChanges(
  member,
  oldFinancial,
  newFinancial,
  options = {},
  client = pool
) {
  await ensureTransactionsTable(client);

  const createdTransactions = [];
  const memberDbId = getMemberDbId(member);

  if (!memberDbId) {
    return createdTransactions;
  }

  for (const field of BALANCE_FIELDS) {
    const beforeValue = toNumber(oldFinancial?.[field.key]);
    const afterValue = toNumber(newFinancial?.[field.key]);

    if (beforeValue === afterValue) {
      continue;
    }

    const difference = afterValue - beforeValue;
    const amount = Math.abs(difference);

    if (amount <= 0) {
      continue;
    }

    const isIncrease = difference > 0;

    const transaction = await createTransactionRecord(
      {
        member,
        transaction_type: isIncrease ? field.increaseType : field.decreaseType,
        amount,
        direction: isIncrease ? "credit" : "debit",
        status: "Completed",
        source: options.source || "Admin Update",
        source_id: options.source_id || null,
        request_id: options.request_id || null,
        balance_field: field.key,
        balance_before: beforeValue,
        balance_after: afterValue,
        record_month: options.record_month || options.recordMonth || null,
        remarks:
          options.remarks ||
          `${field.label} changed from ${beforeValue} to ${afterValue}.`,
        transaction_date: options.transaction_date || null,
      },
      client
    );

    createdTransactions.push(transaction);
  }

  return createdTransactions;
}

function buildTransactionSummary(transactions) {
  const totalCredit = transactions
    .filter((transaction) => transaction.direction === "credit")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  const totalDebit = transactions
    .filter((transaction) => transaction.direction === "debit")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  const completedCount = transactions.filter((transaction) => {
    const status = String(transaction.status || "").toLowerCase();
    return status === "completed" || status === "approved" || status === "paid";
  }).length;

  const pendingCount = transactions.filter((transaction) => {
    const status = String(transaction.status || "").toLowerCase();
    return status === "pending" || status === "processing";
  }).length;

  const failedCount = transactions.filter((transaction) => {
    const status = String(transaction.status || "").toLowerCase();
    return status === "failed" || status === "cancelled" || status === "rejected";
  }).length;

  return {
    total_credit: totalCredit,
    total_debit: totalDebit,
    net_movement: totalCredit - totalDebit,
    total_records: transactions.length,
    completed_count: completedCount,
    pending_count: pendingCount,
    failed_count: failedCount,
  };
}

function applyTransactionFilters(rows, query) {
  const search = String(query.search || query.q || "").trim().toLowerCase();
  const type = String(query.type || "All").trim().toLowerCase();
  const status = String(query.status || "All").trim().toLowerCase();

  return rows.filter((transaction) => {
    const text = [
      transaction.transaction_code,
      transaction.reference_no,
      transaction.member_code,
      transaction.username,
      transaction.member_name,
      transaction.transaction_type,
      transaction.status,
      transaction.source,
      transaction.balance_field,
      transaction.remarks,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !search || text.includes(search);
    const matchesType =
      !type ||
      type === "all" ||
      String(transaction.transaction_type || "").toLowerCase() === type;
    const matchesStatus =
      !status ||
      status === "all" ||
      String(transaction.status || "").toLowerCase() === status;

    return matchesSearch && matchesType && matchesStatus;
  });
}

const getMemberTransactions = async (req, res) => {
  try {
    await ensureTransactionsTable();

    const { identifier } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM member_transactions
      WHERE
        member_db_id IN (
          SELECT id
          FROM members
          WHERE id::TEXT = $1 OR member_id = $1 OR username = $1
        )
        OR member_code = $1
        OR username = $1
      ORDER BY created_at DESC, id DESC
      `,
      [String(identifier).trim()]
    );

    const transactions = applyTransactionFilters(result.rows, req.query);

    res.json({
      message: "Member transactions loaded successfully",
      transactions,
      summary: buildTransactionSummary(transactions),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load member transactions",
      error: error.message,
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    await ensureTransactionsTable();

    const result = await pool.query(
      `
      SELECT *
      FROM member_transactions
      ORDER BY created_at DESC, id DESC
      `
    );

    const transactions = applyTransactionFilters(result.rows, req.query);

    res.json({
      message: "Transactions loaded successfully",
      transactions,
      summary: buildTransactionSummary(transactions),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load transactions",
      error: error.message,
    });
  }
};

const createManualTransaction = async (req, res) => {
  try {
    const {
      member_identifier,
      member_db_id,
      member_code,
      username,
      member_name,
      transaction_type,
      type,
      amount,
      direction,
      status,
      source,
      remarks,
      balance_field,
      balance_before,
      balance_after,
      record_month,
    } = req.body;

    if (!member_identifier && !member_db_id && !member_code && !username) {
      return res.status(400).json({
        message: "Member identifier is required",
      });
    }

    if (!transaction_type && !type) {
      return res.status(400).json({
        message: "Transaction type is required",
      });
    }

    if (toNumber(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    let member = null;

    if (member_identifier || member_code || username || member_db_id) {
      const lookup = String(
        member_identifier || member_code || username || member_db_id
      ).trim();

      const memberResult = await pool.query(
        `
        SELECT id, member_id, full_name, username
        FROM members
        WHERE id::TEXT = $1 OR member_id = $1 OR username = $1
        LIMIT 1
        `,
        [lookup]
      );

      member = memberResult.rows[0] || null;
    }

    const transaction = await createTransactionRecord({
      member,
      member_db_id,
      member_code,
      username,
      member_name,
      transaction_type: transaction_type || type,
      amount,
      direction: direction || "credit",
      status: status || "Completed",
      source: source || "Manual Transaction",
      remarks: remarks || "Manual transaction recorded by admin.",
      balance_field,
      balance_before,
      balance_after,
      record_month,
    });

    res.status(201).json({
      message: "Transaction recorded successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to record transaction",
      error: error.message,
    });
  }
};

const importCurrentBalances = async (req, res) => {
  try {
    await ensureTransactionsTable();

    const result = await pool.query(
      `
      SELECT
        m.id,
        m.member_id,
        m.full_name,
        m.username,

        COALESCE(f.share_capital, 0) AS share_capital,
        COALESCE(f.savings, 0) AS savings,
        COALESCE(f.special_savings, 0) AS special_savings,
        COALESCE(f.dividend_amount, 0) AS dividend_amount,

        COALESCE(f.regular_loan, 0) AS regular_loan,
        COALESCE(f.regular_loan_diminishing, 0) AS regular_loan_diminishing,
        COALESCE(f.educational_loan, 0) AS educational_loan,
        COALESCE(f.educational_loan_diminishing, 0) AS educational_loan_diminishing,
        COALESCE(f.short_term_loan, 0) AS short_term_loan,
        COALESCE(f.short_term_loan_diminishing, 0) AS short_term_loan_diminishing,
        COALESCE(f.appliance_loan, 0) AS appliance_loan,
        COALESCE(f.appliance_loan_diminishing, 0) AS appliance_loan_diminishing,
        COALESCE(f.medical_loan, 0) AS medical_loan,
        COALESCE(f.medical_loan_diminishing, 0) AS medical_loan_diminishing,
        COALESCE(f.petty_cash_loan, 0) AS petty_cash_loan,
        COALESCE(f.vehicle_loan, 0) AS vehicle_loan,
        COALESCE(f.inter_trading_loan, 0) AS inter_trading_loan
      FROM members m
      LEFT JOIN member_financials f
      ON f.member_id = m.id
      ORDER BY m.id ASC
      `
    );

    const createdTransactions = [];

    for (const member of result.rows) {
      for (const field of BALANCE_FIELDS) {
        const currentValue = toNumber(member[field.key]);

        if (currentValue <= 0) {
          continue;
        }

        const exists = await hasExistingImportedTransaction({
          memberDbId: member.id,
          balanceField: field.key,
          source: "Current Balance Import",
        });

        if (exists) {
          continue;
        }

        const transaction = await createTransactionRecord({
          member,
          transaction_type: field.importType,
          amount: currentValue,
          direction: "credit",
          status: "Completed",
          source: "Current Balance Import",
          balance_field: field.key,
          balance_before: 0,
          balance_after: currentValue,
          remarks: `Imported current ${field.label.toLowerCase()} balance as starting transaction.`,
          is_imported_balance: true,
        });

        createdTransactions.push(transaction);
      }
    }

    res.json({
      message: "Current balances imported successfully",
      created_count: createdTransactions.length,
      transactions: createdTransactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to import current balances",
      error: error.message,
    });
  }
};

const rebuildTransactionsFromMonthlySnapshots = async (req, res) => {
  try {
    await ensureTransactionsTable();

    const result = await pool.query(
      `
      SELECT
        m.id,
        m.member_id,
        m.full_name,
        m.username,

        mm.record_month,
        mm.updated_at,

        COALESCE(mm.share_capital, 0) AS share_capital,
        COALESCE(mm.savings, 0) AS savings,
        COALESCE(mm.special_savings, 0) AS special_savings,
        COALESCE(mm.dividend_amount, 0) AS dividend_amount,

        COALESCE(mm.regular_loan, 0) AS regular_loan,
        COALESCE(mm.regular_loan_diminishing, 0) AS regular_loan_diminishing,
        COALESCE(mm.educational_loan, 0) AS educational_loan,
        COALESCE(mm.educational_loan_diminishing, 0) AS educational_loan_diminishing,
        COALESCE(mm.short_term_loan, 0) AS short_term_loan,
        COALESCE(mm.short_term_loan_diminishing, 0) AS short_term_loan_diminishing,
        COALESCE(mm.appliance_loan, 0) AS appliance_loan,
        COALESCE(mm.appliance_loan_diminishing, 0) AS appliance_loan_diminishing,
        COALESCE(mm.medical_loan, 0) AS medical_loan,
        COALESCE(mm.medical_loan_diminishing, 0) AS medical_loan_diminishing,
        COALESCE(mm.petty_cash_loan, 0) AS petty_cash_loan,
        COALESCE(mm.vehicle_loan, 0) AS vehicle_loan,
        COALESCE(mm.inter_trading_loan, 0) AS inter_trading_loan
      FROM member_monthly_financials mm
      INNER JOIN members m
      ON m.id = mm.member_id
      ORDER BY m.id ASC, mm.record_month ASC
      `
    );

    const grouped = new Map();

    result.rows.forEach((row) => {
      if (!grouped.has(row.id)) {
        grouped.set(row.id, []);
      }

      grouped.get(row.id).push(row);
    });

    const createdTransactions = [];

    for (const records of grouped.values()) {
      let previousRecord = null;

      for (const currentRecord of records) {
        const member = {
          id: currentRecord.id,
          member_id: currentRecord.member_id,
          full_name: currentRecord.full_name,
          username: currentRecord.username,
        };

        for (const field of BALANCE_FIELDS) {
          const beforeValue = previousRecord ? toNumber(previousRecord[field.key]) : 0;
          const afterValue = toNumber(currentRecord[field.key]);

          if (beforeValue === afterValue) {
            continue;
          }

          const difference = afterValue - beforeValue;
          const amount = Math.abs(difference);

          if (amount <= 0) {
            continue;
          }

          const exists = await hasExistingImportedTransaction({
            memberDbId: currentRecord.id,
            balanceField: field.key,
            source: "Monthly Snapshot Rebuild",
            recordMonth: currentRecord.record_month,
          });

          if (exists) {
            continue;
          }

          const isIncrease = difference > 0;

          const transaction = await createTransactionRecord({
            member,
            transaction_type: previousRecord
              ? isIncrease
                ? field.increaseType
                : field.decreaseType
              : field.importType,
            amount,
            direction: isIncrease ? "credit" : "debit",
            status: "Completed",
            source: "Monthly Snapshot Rebuild",
            balance_field: field.key,
            balance_before: beforeValue,
            balance_after: afterValue,
            record_month: currentRecord.record_month,
            remarks: previousRecord
              ? `${field.label} changed from ${beforeValue} to ${afterValue} based on monthly records.`
              : `Imported ${field.label.toLowerCase()} starting balance from monthly records.`,
            is_imported_balance: !previousRecord,
            transaction_date: getTransactionDateFromMonth(currentRecord.record_month),
          });

          createdTransactions.push(transaction);
        }

        previousRecord = currentRecord;
      }
    }

    res.json({
      message: "Transactions rebuilt from monthly financial snapshots",
      created_count: createdTransactions.length,
      transactions: createdTransactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to rebuild transactions from monthly records",
      error: error.message,
    });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    await ensureTransactionsTable();

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE member_transactions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction status updated successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update transaction status",
      error: error.message,
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    await ensureTransactionsTable();

    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM member_transactions
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction deleted successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};

module.exports = {
  BALANCE_FIELDS,
  toNumber,
  cleanMonth,
  ensureTransactionsTable,
  getBalanceFieldConfig,
  createTransactionRecord,
  recordBalanceChanges,

  getMemberTransactions,
  getAllTransactions,
  createManualTransaction,
  importCurrentBalances,
  rebuildTransactionsFromMonthlySnapshots,
  updateTransactionStatus,
  deleteTransaction,
};