// controllers/memberController.js

const bcrypt = require("bcryptjs");
const pool = require("../db");

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

module.exports = {
  getMembers,
  addMember,
};