// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const registerAdmin = async (req, res) => {
  try {
    const { full_name, username, password } = req.body;

    if (!full_name || !username || !password) {
      return res.status(400).json({
        message: "Full name, username, and password are required",
      });
    }

    const existingAdmin = await pool.query(
      "SELECT * FROM admin_users WHERE username = $1",
      [username]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(409).json({
        message: "Admin username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admin_users (full_name, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, username, created_at`,
      [full_name, username, passwordHash]
    );

    res.status(201).json({
      message: "Admin registered successfully",
      admin: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Admin registration failed",
      error: error.message,
    });
  }
};

const registerMember = async (req, res) => {
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
      `INSERT INTO members (member_id, full_name, username, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, member_id, full_name, username, status, created_at`,
      [member_id, full_name, username, passwordHash]
    );

    const member = memberResult.rows[0];

    await pool.query(
      `INSERT INTO member_financials (member_id)
       VALUES ($1)`,
      [member.id]
    );

    res.status(201).json({
      message: "Member registered successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({
      message: "Member registration failed",
      error: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM admin_users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid admin username or password",
      });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid admin username or password",
      });
    }

    const token = createToken({
      id: admin.id,
      role: "admin",
      username: admin.username,
    });

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin.id,
        full_name: admin.full_name,
        username: admin.username,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Admin login failed",
      error: error.message,
    });
  }
};

const loginMember = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM members WHERE username = $1 OR member_id = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid member username or password",
      });
    }

    const member = result.rows[0];

    const isMatch = await bcrypt.compare(password, member.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid member username or password",
      });
    }

    const token = createToken({
      id: member.id,
      role: "member",
      username: member.username,
    });

    res.json({
      message: "Member login successful",
      token,
      user: {
        id: member.id,
        member_id: member.member_id,
        full_name: member.full_name,
        username: member.username,
        status: member.status,
        role: "member",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Member login failed",
      error: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  registerMember,
  loginAdmin,
  loginMember,
};