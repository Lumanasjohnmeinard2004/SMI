// controllers/memberCompanyController.js

const pool = require("../db");

const ALLOWED_COMPANIES = [
  "Company 1",
  "Company 2",
  "Company 3",
  "Company 4",
];

function cleanCompany(value) {
  const company = String(value || "").trim();

  if (!ALLOWED_COMPANIES.includes(company)) {
    return "Company 1";
  }

  return company;
}

const getMemberCompany = async (req, res) => {
  try {
    const { identifier } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        member_id,
        full_name,
        username,
        status,
        COALESCE(company, 'Company 1') AS company
      FROM members
      WHERE id::TEXT = $1
         OR member_id = $1
         OR username = $1
      LIMIT 1
      `,
      [String(identifier).trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.json({
      message: "Member company loaded successfully",
      member: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load member company",
      error: error.message,
    });
  }
};

const updateMemberCompany = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { company } = req.body;

    const selectedCompany = cleanCompany(company);

    const result = await pool.query(
      `
      UPDATE members
      SET company = $1
      WHERE id::TEXT = $2
         OR member_id = $2
         OR username = $2
      RETURNING
        id,
        member_id,
        full_name,
        username,
        status,
        company
      `,
      [selectedCompany, String(identifier).trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.json({
      message: "Member company updated successfully",
      member: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update member company",
      error: error.message,
    });
  }
};

module.exports = {
  ALLOWED_COMPANIES,
  getMemberCompany,
  updateMemberCompany,
};