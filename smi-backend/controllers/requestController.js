// controllers/requestController.js

const pool = require("../db");

function toNumber(value) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

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

module.exports = {
  getMemberRequests,
  createRequest,
};