// controllers/requestController.js

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

function loanTypeToColumn(loanType) {
  const normalized = String(loanType || "").trim().toLowerCase();

  const map = {
    "regular loan": "regular_loan",
    "regular loan - diminishing": "regular_loan_diminishing",
    "educational loan": "educational_loan",
    "educational loan - diminishing": "educational_loan_diminishing",
    "short-term loan": "short_term_loan",
    "short term loan": "short_term_loan",
    "short-term loan - diminishing": "short_term_loan_diminishing",
    "short term loan - diminishing": "short_term_loan_diminishing",
    "appliance loan": "appliance_loan",
    "appliance loan - diminishing": "appliance_loan_diminishing",
    "medical loan": "medical_loan",
    "medical loan - diminishing": "medical_loan_diminishing",
    "petty cash loan": "petty_cash_loan",
    "vehicle loan": "vehicle_loan",
    "inter-trading loan": "inter_trading_loan",
    "inter trading loan": "inter_trading_loan",
  };

  return map[normalized] || "regular_loan";
}

function loanColumnToDueDateColumn(column) {
  const map = {
    regular_loan: "regular_loan_due_date",
    regular_loan_diminishing: "regular_loan_diminishing_due_date",
    educational_loan: "educational_loan_due_date",
    educational_loan_diminishing: "educational_loan_diminishing_due_date",
    short_term_loan: "short_term_loan_due_date",
    short_term_loan_diminishing: "short_term_loan_diminishing_due_date",
    appliance_loan: "appliance_loan_due_date",
    appliance_loan_diminishing: "appliance_loan_diminishing_due_date",
    medical_loan: "medical_loan_due_date",
    medical_loan_diminishing: "medical_loan_diminishing_due_date",
    petty_cash_loan: "petty_cash_loan_due_date",
    vehicle_loan: "vehicle_loan_due_date",
    inter_trading_loan: "inter_trading_loan_due_date",
  };

  return map[column] || "regular_loan_due_date";
}

async function saveMonthlySnapshot(memberId, recordMonth, client = pool) {
  const financialResult = await client.query(
    `
    SELECT *
    FROM member_financials
    WHERE member_id = $1
    LIMIT 1
    `,
    [memberId]
  );

  if (financialResult.rows.length === 0) {
    return;
  }

  const record = financialResult.rows[0];

  await client.query(
    `
    INSERT INTO member_monthly_financials (
      member_id,
      record_month,

      share_capital,
      savings,
      special_savings,

      regular_loan,
      regular_loan_diminishing,
      educational_loan,
      educational_loan_diminishing,
      short_term_loan,
      short_term_loan_diminishing,
      appliance_loan,
      appliance_loan_diminishing,
      medical_loan,
      medical_loan_diminishing,
      petty_cash_loan,
      vehicle_loan,
      inter_trading_loan,

      dividend_amount
    )
    VALUES (
      $1, $2,
      $3, $4, $5,
      $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
      $19
    )
    ON CONFLICT (member_id, record_month)
    DO UPDATE SET
      share_capital = EXCLUDED.share_capital,
      savings = EXCLUDED.savings,
      special_savings = EXCLUDED.special_savings,

      regular_loan = EXCLUDED.regular_loan,
      regular_loan_diminishing = EXCLUDED.regular_loan_diminishing,
      educational_loan = EXCLUDED.educational_loan,
      educational_loan_diminishing = EXCLUDED.educational_loan_diminishing,
      short_term_loan = EXCLUDED.short_term_loan,
      short_term_loan_diminishing = EXCLUDED.short_term_loan_diminishing,
      appliance_loan = EXCLUDED.appliance_loan,
      appliance_loan_diminishing = EXCLUDED.appliance_loan_diminishing,
      medical_loan = EXCLUDED.medical_loan,
      medical_loan_diminishing = EXCLUDED.medical_loan_diminishing,
      petty_cash_loan = EXCLUDED.petty_cash_loan,
      vehicle_loan = EXCLUDED.vehicle_loan,
      inter_trading_loan = EXCLUDED.inter_trading_loan,

      dividend_amount = EXCLUDED.dividend_amount,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      memberId,
      cleanMonth(recordMonth),

      toNumber(record.share_capital),
      toNumber(record.savings),
      toNumber(record.special_savings),

      toNumber(record.regular_loan),
      toNumber(record.regular_loan_diminishing),
      toNumber(record.educational_loan),
      toNumber(record.educational_loan_diminishing),
      toNumber(record.short_term_loan),
      toNumber(record.short_term_loan_diminishing),
      toNumber(record.appliance_loan),
      toNumber(record.appliance_loan_diminishing),
      toNumber(record.medical_loan),
      toNumber(record.medical_loan_diminishing),
      toNumber(record.petty_cash_loan),
      toNumber(record.vehicle_loan),
      toNumber(record.inter_trading_loan),

      toNumber(record.dividend_amount),
    ]
  );
}

const getAllRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        lr.id,
        lr.member_id,
        lr.loan_type,
        lr.amount,
        lr.purpose,
        lr.status,
        lr.admin_remarks,
        lr.requested_at,
        lr.updated_at,
        m.member_id AS member_code,
        m.full_name,
        m.username
      FROM loan_requests lr
      INNER JOIN members m
      ON m.id = lr.member_id
      ORDER BY lr.requested_at DESC
      `
    );

    res.json({
      message: "Loan requests loaded successfully",
      requests: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load loan requests",
      error: error.message,
    });
  }
};

const getMemberRequests = async (req, res) => {
  try {
    const { identifier } = req.params;

    const result = await pool.query(
      `
      SELECT
        lr.id,
        lr.member_id,
        lr.loan_type,
        lr.amount,
        lr.purpose,
        lr.status,
        lr.admin_remarks,
        lr.requested_at,
        lr.updated_at,
        m.member_id AS member_code,
        m.full_name,
        m.username
      FROM loan_requests lr
      INNER JOIN members m
      ON m.id = lr.member_id
      WHERE m.id::TEXT = $1 OR m.member_id = $1 OR m.username = $1
      ORDER BY lr.requested_at DESC
      `,
      [identifier]
    );

    res.json({
      message: "Member requests loaded successfully",
      requests: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load member requests",
      error: error.message,
    });
  }
};

const createRequest = async (req, res) => {
  try {
    const { member_identifier, loan_type, amount, purpose } = req.body;

    if (!member_identifier || !loan_type || !amount || !purpose) {
      return res.status(400).json({
        message: "Member, loan type, amount, and purpose are required",
      });
    }

    const memberResult = await pool.query(
      `
      SELECT id, member_id, full_name, username
      FROM members
      WHERE id::TEXT = $1 OR member_id = $1 OR username = $1
      LIMIT 1
      `,
      [String(member_identifier).trim()]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    const member = memberResult.rows[0];

    const result = await pool.query(
      `
      INSERT INTO loan_requests (
        member_id,
        loan_type,
        amount,
        purpose,
        status
      )
      VALUES ($1, $2, $3, $4, 'Pending')
      RETURNING
        id,
        member_id,
        loan_type,
        amount,
        purpose,
        status,
        admin_remarks,
        requested_at,
        updated_at
      `,
      [member.id, loan_type, toNumber(amount), purpose]
    );

    res.status(201).json({
      message: "Request submitted successfully",
      request: {
        ...result.rows[0],
        member_code: member.member_id,
        full_name: member.full_name,
        username: member.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create request",
      error: error.message,
    });
  }
};

const updateRequestStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { status, admin_remarks, due_date, record_month } = req.body;

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected",
      });
    }

    if (!admin_remarks || !admin_remarks.trim()) {
      return res.status(400).json({
        message: "Please provide a reason or remarks",
      });
    }

    await client.query("BEGIN");

    const existingRequestResult = await client.query(
      `
      SELECT *
      FROM loan_requests
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (existingRequestResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Loan request not found",
      });
    }

    const existingRequest = existingRequestResult.rows[0];

    if (existingRequest.status !== "Pending") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "This request has already been processed",
      });
    }

    const result = await client.query(
      `
      UPDATE loan_requests
      SET
        status = $1,
        admin_remarks = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING
        id,
        member_id,
        loan_type,
        amount,
        purpose,
        status,
        admin_remarks,
        requested_at,
        updated_at
      `,
      [status, admin_remarks.trim(), id]
    );

    const updatedRequest = result.rows[0];

    if (status === "Approved") {
      const loanColumn = loanTypeToColumn(updatedRequest.loan_type);
      const dueDateColumn = loanColumnToDueDateColumn(loanColumn);
      const approvedAmount = toNumber(updatedRequest.amount);
      const selectedMonth = cleanMonth(record_month);

      await client.query(
        `
        INSERT INTO member_financials (member_id)
        VALUES ($1)
        ON CONFLICT (member_id) DO NOTHING
        `,
        [updatedRequest.member_id]
      );

      await client.query(
        `
        UPDATE member_financials
        SET
          ${loanColumn} = COALESCE(${loanColumn}, 0) + $2,
          ${dueDateColumn} =
            CASE
              WHEN NULLIF($3, '')::date IS NULL THEN ${dueDateColumn}
              ELSE NULLIF($3, '')::date
            END,
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = $1
        `,
        [updatedRequest.member_id, approvedAmount, due_date || ""]
      );

      await saveMonthlySnapshot(updatedRequest.member_id, selectedMonth, client);
    }

    await client.query("COMMIT");

    res.json({
      message:
        status === "Approved"
          ? "Loan request approved and member loan balance updated"
          : "Loan request rejected successfully",
      request: updatedRequest,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: "Failed to update loan request",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllRequests,
  getMemberRequests,
  createRequest,
  updateRequestStatus,
};