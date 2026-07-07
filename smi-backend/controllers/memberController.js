// controllers/memberController.js

const bcrypt = require("bcryptjs");
const pool = require("../db");

function toNumber(value) {
  const parsed = Number(value || 0);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

function cleanDate(value) {
  if (!value) {
    return null;
  }

  const cleaned = String(value).trim();

  if (!cleaned) {
    return null;
  }

  return cleaned;
}

const financialSelectFields = `
  COALESCE(f.share_capital, 0) AS share_capital,
  COALESCE(f.savings, 0) AS savings,
  COALESCE(f.special_savings, 0) AS special_savings,

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
  COALESCE(f.inter_trading_loan, 0) AS inter_trading_loan,

  COALESCE(f.dividend_amount, 0) AS dividend_amount,

  f.regular_loan_due_date,
  f.regular_loan_diminishing_due_date,
  f.educational_loan_due_date,
  f.educational_loan_diminishing_due_date,
  f.short_term_loan_due_date,
  f.short_term_loan_diminishing_due_date,
  f.appliance_loan_due_date,
  f.appliance_loan_diminishing_due_date,
  f.medical_loan_due_date,
  f.medical_loan_diminishing_due_date,
  f.petty_cash_loan_due_date,
  f.vehicle_loan_due_date,
  f.inter_trading_loan_due_date
`;

const getMembers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        m.id,
        m.member_id,
        m.full_name,
        m.username,
        m.status,
        m.created_at,
        ${financialSelectFields}
      FROM members m
      LEFT JOIN member_financials f
      ON f.member_id = m.id
      ORDER BY m.id DESC
      `
    );

    res.json({
      members: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch members",
      error: error.message,
    });
  }
};

const addMember = async (req, res) => {
  try {
    const { member_id, full_name, username, password } = req.body;

    if (!member_id || !full_name || !username || !password) {
      return res.status(400).json({
        message: "Member ID, full name, username, and password are required",
      });
    }

    const existingMember = await pool.query(
      "SELECT * FROM members WHERE username = $1 OR member_id = $2",
      [username, member_id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        message: "Member username or member ID already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const memberResult = await pool.query(
      `
      INSERT INTO members (member_id, full_name, username, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, member_id, full_name, username, status, created_at
      `,
      [member_id, full_name, username, passwordHash]
    );

    const member = memberResult.rows[0];

    await pool.query(
      `
      INSERT INTO member_financials (member_id)
      VALUES ($1)
      ON CONFLICT (member_id) DO NOTHING
      `,
      [member.id]
    );

    const fullMemberResult = await pool.query(
      `
      SELECT
        m.id,
        m.member_id,
        m.full_name,
        m.username,
        m.status,
        m.created_at,
        ${financialSelectFields}
      FROM members m
      LEFT JOIN member_financials f
      ON f.member_id = m.id
      WHERE m.id = $1
      LIMIT 1
      `,
      [member.id]
    );

    res.status(201).json({
      message: "Member added successfully",
      member: fullMemberResult.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add member",
      error: error.message,
    });
  }
};

const saveManualFinancialRecord = async (req, res) => {
  try {
    const {
      member_identifier,

      share_capital,
      savings,
      special_savings,
      dividend_amount,

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

      regular_loan_due_date,
      regular_loan_diminishing_due_date,
      educational_loan_due_date,
      educational_loan_diminishing_due_date,
      short_term_loan_due_date,
      short_term_loan_diminishing_due_date,
      appliance_loan_due_date,
      appliance_loan_diminishing_due_date,
      medical_loan_due_date,
      medical_loan_diminishing_due_date,
      petty_cash_loan_due_date,
      vehicle_loan_due_date,
      inter_trading_loan_due_date,
    } = req.body;

    if (!member_identifier) {
      return res.status(400).json({
        message: "Member username or member ID is required",
      });
    }

    const memberResult = await pool.query(
      `
      SELECT id, member_id, full_name, username, status
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

    await pool.query(
      `
      INSERT INTO member_financials (member_id)
      VALUES ($1)
      ON CONFLICT (member_id) DO NOTHING
      `,
      [member.id]
    );

    const values = [
      member.id,

      toNumber(share_capital),
      toNumber(savings),
      toNumber(special_savings),
      toNumber(dividend_amount),

      toNumber(regular_loan),
      toNumber(regular_loan_diminishing),
      toNumber(educational_loan),
      toNumber(educational_loan_diminishing),
      toNumber(short_term_loan),
      toNumber(short_term_loan_diminishing),
      toNumber(appliance_loan),
      toNumber(appliance_loan_diminishing),
      toNumber(medical_loan),
      toNumber(medical_loan_diminishing),
      toNumber(petty_cash_loan),
      toNumber(vehicle_loan),
      toNumber(inter_trading_loan),

      cleanDate(regular_loan_due_date),
      cleanDate(regular_loan_diminishing_due_date),
      cleanDate(educational_loan_due_date),
      cleanDate(educational_loan_diminishing_due_date),
      cleanDate(short_term_loan_due_date),
      cleanDate(short_term_loan_diminishing_due_date),
      cleanDate(appliance_loan_due_date),
      cleanDate(appliance_loan_diminishing_due_date),
      cleanDate(medical_loan_due_date),
      cleanDate(medical_loan_diminishing_due_date),
      cleanDate(petty_cash_loan_due_date),
      cleanDate(vehicle_loan_due_date),
      cleanDate(inter_trading_loan_due_date),
    ];

    const financialResult = await pool.query(
      `
      UPDATE member_financials
      SET
        share_capital = COALESCE(share_capital, 0) + $2,
        savings = COALESCE(savings, 0) + $3,
        special_savings = COALESCE(special_savings, 0) + $4,
        dividend_amount = COALESCE(dividend_amount, 0) + $5,

        regular_loan = COALESCE(regular_loan, 0) + $6,
        regular_loan_diminishing = COALESCE(regular_loan_diminishing, 0) + $7,
        educational_loan = COALESCE(educational_loan, 0) + $8,
        educational_loan_diminishing = COALESCE(educational_loan_diminishing, 0) + $9,
        short_term_loan = COALESCE(short_term_loan, 0) + $10,
        short_term_loan_diminishing = COALESCE(short_term_loan_diminishing, 0) + $11,
        appliance_loan = COALESCE(appliance_loan, 0) + $12,
        appliance_loan_diminishing = COALESCE(appliance_loan_diminishing, 0) + $13,
        medical_loan = COALESCE(medical_loan, 0) + $14,
        medical_loan_diminishing = COALESCE(medical_loan_diminishing, 0) + $15,
        petty_cash_loan = COALESCE(petty_cash_loan, 0) + $16,
        vehicle_loan = COALESCE(vehicle_loan, 0) + $17,
        inter_trading_loan = COALESCE(inter_trading_loan, 0) + $18,

        regular_loan_due_date =
          CASE WHEN $19::date IS NULL THEN regular_loan_due_date ELSE $19::date END,

        regular_loan_diminishing_due_date =
          CASE WHEN $20::date IS NULL THEN regular_loan_diminishing_due_date ELSE $20::date END,

        educational_loan_due_date =
          CASE WHEN $21::date IS NULL THEN educational_loan_due_date ELSE $21::date END,

        educational_loan_diminishing_due_date =
          CASE WHEN $22::date IS NULL THEN educational_loan_diminishing_due_date ELSE $22::date END,

        short_term_loan_due_date =
          CASE WHEN $23::date IS NULL THEN short_term_loan_due_date ELSE $23::date END,

        short_term_loan_diminishing_due_date =
          CASE WHEN $24::date IS NULL THEN short_term_loan_diminishing_due_date ELSE $24::date END,

        appliance_loan_due_date =
          CASE WHEN $25::date IS NULL THEN appliance_loan_due_date ELSE $25::date END,

        appliance_loan_diminishing_due_date =
          CASE WHEN $26::date IS NULL THEN appliance_loan_diminishing_due_date ELSE $26::date END,

        medical_loan_due_date =
          CASE WHEN $27::date IS NULL THEN medical_loan_due_date ELSE $27::date END,

        medical_loan_diminishing_due_date =
          CASE WHEN $28::date IS NULL THEN medical_loan_diminishing_due_date ELSE $28::date END,

        petty_cash_loan_due_date =
          CASE WHEN $29::date IS NULL THEN petty_cash_loan_due_date ELSE $29::date END,

        vehicle_loan_due_date =
          CASE WHEN $30::date IS NULL THEN vehicle_loan_due_date ELSE $30::date END,

        inter_trading_loan_due_date =
          CASE WHEN $31::date IS NULL THEN inter_trading_loan_due_date ELSE $31::date END,

        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = $1
      RETURNING *
      `,
      values
    );

    const updatedMemberResult = await pool.query(
      `
      SELECT
        m.id,
        m.member_id,
        m.full_name,
        m.username,
        m.status,
        m.created_at,
        ${financialSelectFields}
      FROM members m
      LEFT JOIN member_financials f
      ON f.member_id = m.id
      WHERE m.id = $1
      LIMIT 1
      `,
      [member.id]
    );

    res.json({
      message: "Financial record added successfully",
      financial_record: financialResult.rows[0],
      member: updatedMemberResult.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save manual financial record",
      error: error.message,
    });
  }
};

const getMemberFinancials = async (req, res) => {
  try {
    const { identifier } = req.params;

    const result = await pool.query(
      `
      SELECT
        m.id,
        m.member_id,
        m.full_name,
        m.username,
        m.status,
        m.created_at,
        ${financialSelectFields}
      FROM members m
      LEFT JOIN member_financials f
      ON f.member_id = m.id
      WHERE m.id::TEXT = $1 OR m.member_id = $1 OR m.username = $1
      LIMIT 1
      `,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member financial record not found",
      });
    }

    res.json({
      member: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch member financial record",
      error: error.message,
    });
  }
};

module.exports = {
  getMembers,
  addMember,
  saveManualFinancialRecord,
  getMemberFinancials,
};