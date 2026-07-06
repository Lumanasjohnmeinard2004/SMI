// controllers/memberController.js

const bcrypt = require("bcryptjs");
const pool = require("../db");

function toNumber(value) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

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

        COALESCE(f.savings, 0) AS savings,
        COALESCE(f.share_capital, 0) AS share_capital,
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

        COALESCE(f.dividend_amount, 0) AS dividend_amount
      FROM members m
      LEFT JOIN member_financials f
      ON f.member_id = m.id
      ORDER BY m.id DESC
      `
    );

    res.json({
      message: "Members loaded successfully",
      members: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load members",
      error: error.message,
    });
  }
};

const addMember = async (req, res) => {
  const client = await pool.connect();

  try {
    const { member_id, full_name, username, password } = req.body;

    if (!member_id || !full_name || !username || !password) {
      return res.status(400).json({
        message: "Member ID, full name, username, and password are required",
      });
    }

    await client.query("BEGIN");

    const existingMember = await client.query(
      `
      SELECT id
      FROM members
      WHERE member_id = $1 OR username = $2
      `,
      [member_id, username]
    );

    if (existingMember.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "Member ID or username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const memberResult = await client.query(
      `
      INSERT INTO members (
        member_id,
        full_name,
        username,
        password_hash,
        status
      )
      VALUES ($1, $2, $3, $4, 'Active')
      RETURNING id, member_id, full_name, username, status, created_at
      `,
      [member_id, full_name, username, passwordHash]
    );

    const member = memberResult.rows[0];

    await client.query(
      `
      INSERT INTO member_financials (
        member_id,
        savings,
        share_capital,
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
        $1,
        0, 0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0, 0,
        0
      )
      `,
      [member.id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Member added successfully",
      member: {
        ...member,
        savings: 0,
        share_capital: 0,
        special_savings: 0,
        regular_loan: 0,
        regular_loan_diminishing: 0,
        educational_loan: 0,
        educational_loan_diminishing: 0,
        short_term_loan: 0,
        short_term_loan_diminishing: 0,
        appliance_loan: 0,
        appliance_loan_diminishing: 0,
        medical_loan: 0,
        medical_loan_diminishing: 0,
        petty_cash_loan: 0,
        vehicle_loan: 0,
        inter_trading_loan: 0,
        dividend_amount: 0,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: "Failed to add member",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

const saveManualFinancialRecord = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      member_identifier,

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
      dividend_amount,
    } = req.body;

    if (!member_identifier) {
      return res.status(400).json({
        message: "Member ID or username is required",
      });
    }

    await client.query("BEGIN");

    const memberResult = await client.query(
      `
      SELECT id, member_id, full_name, username, status
      FROM members
      WHERE member_id = $1 OR username = $1
      LIMIT 1
      `,
      [member_identifier.trim()]
    );

    if (memberResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Member not found. Use an existing Member ID or username.",
      });
    }

    const member = memberResult.rows[0];

    await client.query(
      `
      INSERT INTO member_financials (
        member_id,
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
        dividend_amount,
        updated_at
      )
      VALUES (
        $1,
        $2, $3, $4,
        $5, $6,
        $7, $8,
        $9, $10,
        $11, $12,
        $13, $14,
        $15, $16, $17,
        $18,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (member_id)
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
        member.id,
        toNumber(share_capital),
        toNumber(savings),
        toNumber(special_savings),

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

        toNumber(dividend_amount),
      ]
    );

    const updatedResult = await client.query(
      `
      SELECT
        m.id,
        m.member_id,
        m.full_name,
        m.username,
        m.status,

        COALESCE(f.savings, 0) AS savings,
        COALESCE(f.share_capital, 0) AS share_capital,
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
        f.updated_at
      FROM members m
      LEFT JOIN member_financials f
      ON f.member_id = m.id
      WHERE m.id = $1
      `,
      [member.id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Manual financial record saved successfully",
      member: updatedResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: "Failed to save manual financial record",
      error: error.message,
    });
  } finally {
    client.release();
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

        COALESCE(f.savings, 0) AS savings,
        COALESCE(f.share_capital, 0) AS share_capital,
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
        f.updated_at
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
      message: "Member financial record loaded successfully",
      member: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load member financial record",
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