// controllers/memberController.js

const bcrypt = require("bcryptjs");
const pool = require("../db");

function toNumber(value) {
  const parsed = Number(String(value || "").replace(/,/g, "").trim());

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

function cleanName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function toTitleCase(value) {
  return cleanName(value)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildFullName(firstName, middleInitial, lastName) {
  const first = toTitleCase(firstName);
  const middle = cleanName(middleInitial).replace(".", "").toUpperCase();
  const last = toTitleCase(lastName);

  if (middle) {
    return `${first} ${middle}. ${last}`.replace(/\s+/g, " ").trim();
  }

  return `${first} ${last}`.replace(/\s+/g, " ").trim();
}

function buildUsername(firstName, lastName, number) {
  const first = String(firstName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const last = String(lastName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const fallback = `member${number || Date.now()}`;

  return `${first}${last}` || fallback;
}

async function getUniqueMemberId(preferredId, client = pool) {
  let baseId = preferredId || "SMI-001";
  let candidate = baseId;
  let counter = 1;

  while (true) {
    const result = await client.query(
      "SELECT id FROM members WHERE member_id = $1 LIMIT 1",
      [candidate]
    );

    if (result.rows.length === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseId}-${counter}`;
  }
}

async function getUniqueUsername(preferredUsername, client = pool) {
  let baseUsername = preferredUsername || "member";
  let candidate = baseUsername;
  let counter = 1;

  while (true) {
    const result = await client.query(
      "SELECT id FROM members WHERE username = $1 LIMIT 1",
      [candidate]
    );

    if (result.rows.length === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseUsername}${counter}`;
  }
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
        m.profile_image,
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
      RETURNING id, member_id, full_name, username, status, profile_image, created_at
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
        m.profile_image,
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
      SELECT id, member_id, full_name, username, status, profile_image
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
        m.profile_image,
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

const importExcelFinancialRecords = async (req, res) => {
  const client = await pool.connect();

  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        message: "No Excel records received",
      });
    }

    await client.query("BEGIN");

    const defaultPasswordHash = await bcrypt.hash("member123", 10);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of records) {
      const rowNumber = row.no;
      const firstName = cleanName(row.first_name);
      const middleInitial = cleanName(row.middle_initial);
      const lastName = cleanName(row.last_name);

      if (!firstName || !lastName) {
        skippedCount += 1;
        continue;
      }

      const fullName = buildFullName(firstName, middleInitial, lastName);

      let memberResult = await client.query(
        `
        SELECT id, member_id, full_name, username, status, profile_image
        FROM members
        WHERE LOWER(full_name) = LOWER($1)
        LIMIT 1
        `,
        [fullName]
      );

      let member;

      if (memberResult.rows.length > 0) {
        member = memberResult.rows[0];
        updatedCount += 1;
      } else {
        const preferredMemberId = `SMI-${String(rowNumber || Date.now()).padStart(3, "0")}`;
        const uniqueMemberId = await getUniqueMemberId(preferredMemberId, client);
        const uniqueUsername = await getUniqueUsername(
          buildUsername(firstName, lastName, rowNumber),
          client
        );

        const createdMemberResult = await client.query(
          `
          INSERT INTO members (
            member_id,
            full_name,
            username,
            password_hash,
            status
          )
          VALUES ($1, $2, $3, $4, 'Active')
          RETURNING id, member_id, full_name, username, status, profile_image
          `,
          [uniqueMemberId, fullName, uniqueUsername, defaultPasswordHash]
        );

        member = createdMemberResult.rows[0];
        createdCount += 1;
      }

      await client.query(
        `
        INSERT INTO member_financials (member_id)
        VALUES ($1)
        ON CONFLICT (member_id) DO NOTHING
        `,
        [member.id]
      );

      await client.query(
        `
        UPDATE member_financials
        SET
          share_capital = $2,
          savings = $3,
          special_savings = $4,

          regular_loan = $5,
          regular_loan_diminishing = $6,
          educational_loan = $7,
          educational_loan_diminishing = $8,
          short_term_loan = $9,
          short_term_loan_diminishing = $10,
          appliance_loan = $11,
          appliance_loan_diminishing = $12,
          medical_loan = $13,
          medical_loan_diminishing = $14,
          petty_cash_loan = $15,
          vehicle_loan = $16,
          inter_trading_loan = $17,

          dividend_amount = $18,
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = $1
        `,
        [
          member.id,

          toNumber(row.share_capital),
          toNumber(row.savings),
          toNumber(row.special_savings),

          toNumber(row.regular_loan),
          toNumber(row.regular_loan_diminishing),
          toNumber(row.educational_loan),
          toNumber(row.educational_loan_diminishing),
          toNumber(row.short_term_loan),
          toNumber(row.short_term_loan_diminishing),
          toNumber(row.appliance_loan),
          toNumber(row.appliance_loan_diminishing),
          toNumber(row.medical_loan),
          toNumber(row.medical_loan_diminishing),
          toNumber(row.petty_cash_loan),
          toNumber(row.vehicle_loan),
          toNumber(row.inter_trading_loan),

          toNumber(row.dividend_amount),
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Excel records imported successfully",
      created_count: createdCount,
      updated_count: updatedCount,
      skipped_count: skippedCount,
      total_received: records.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: "Failed to import Excel records",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

const updateMemberFinancialRecord = async (req, res) => {
  try {
    const { identifier } = req.params;

    const {
      full_name,
      member_id,
      username,
      status,

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

    if (!full_name || !member_id || !username) {
      return res.status(400).json({
        message: "Full name, member ID, and username are required",
      });
    }

    const memberResult = await pool.query(
      `
      SELECT id
      FROM members
      WHERE id::TEXT = $1 OR member_id = $1 OR username = $1
      LIMIT 1
      `,
      [String(identifier).trim()]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    const member = memberResult.rows[0];

    const duplicateResult = await pool.query(
      `
      SELECT id
      FROM members
      WHERE (member_id = $1 OR username = $2)
      AND id <> $3
      LIMIT 1
      `,
      [member_id.trim(), username.trim(), member.id]
    );

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        message: "Member ID or username already belongs to another member",
      });
    }

    await pool.query(
      `
      UPDATE members
      SET
        full_name = $1,
        member_id = $2,
        username = $3,
        status = $4
      WHERE id = $5
      `,
      [
        full_name.trim(),
        member_id.trim(),
        username.trim(),
        status || "Active",
        member.id,
      ]
    );

    await pool.query(
      `
      INSERT INTO member_financials (member_id)
      VALUES ($1)
      ON CONFLICT (member_id) DO NOTHING
      `,
      [member.id]
    );

    await pool.query(
      `
      UPDATE member_financials
      SET
        share_capital = $2,
        savings = $3,
        special_savings = $4,
        dividend_amount = $5,

        regular_loan = $6,
        regular_loan_diminishing = $7,
        educational_loan = $8,
        educational_loan_diminishing = $9,
        short_term_loan = $10,
        short_term_loan_diminishing = $11,
        appliance_loan = $12,
        appliance_loan_diminishing = $13,
        medical_loan = $14,
        medical_loan_diminishing = $15,
        petty_cash_loan = $16,
        vehicle_loan = $17,
        inter_trading_loan = $18,

        regular_loan_due_date = NULLIF($19, '')::date,
        regular_loan_diminishing_due_date = NULLIF($20, '')::date,
        educational_loan_due_date = NULLIF($21, '')::date,
        educational_loan_diminishing_due_date = NULLIF($22, '')::date,
        short_term_loan_due_date = NULLIF($23, '')::date,
        short_term_loan_diminishing_due_date = NULLIF($24, '')::date,
        appliance_loan_due_date = NULLIF($25, '')::date,
        appliance_loan_diminishing_due_date = NULLIF($26, '')::date,
        medical_loan_due_date = NULLIF($27, '')::date,
        medical_loan_diminishing_due_date = NULLIF($28, '')::date,
        petty_cash_loan_due_date = NULLIF($29, '')::date,
        vehicle_loan_due_date = NULLIF($30, '')::date,
        inter_trading_loan_due_date = NULLIF($31, '')::date,

        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = $1
      `,
      [
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

        regular_loan_due_date || "",
        regular_loan_diminishing_due_date || "",
        educational_loan_due_date || "",
        educational_loan_diminishing_due_date || "",
        short_term_loan_due_date || "",
        short_term_loan_diminishing_due_date || "",
        appliance_loan_due_date || "",
        appliance_loan_diminishing_due_date || "",
        medical_loan_due_date || "",
        medical_loan_diminishing_due_date || "",
        petty_cash_loan_due_date || "",
        vehicle_loan_due_date || "",
        inter_trading_loan_due_date || "",
      ]
    );

    const updatedMemberResult = await pool.query(
      `
      SELECT
        m.id,
        m.member_id,
        m.full_name,
        m.username,
        m.status,
        m.profile_image,
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
      message: "Member record updated successfully",
      member: updatedMemberResult.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update member record",
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
        m.profile_image,
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

const updateMemberProfileImage = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { profile_image } = req.body;

    if (!profile_image) {
      return res.status(400).json({
        message: "Profile image is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE members
      SET profile_image = $1
      WHERE id::TEXT = $2 OR member_id = $2 OR username = $2
      RETURNING id, member_id, full_name, username, status, profile_image, created_at
      `,
      [profile_image, identifier]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.json({
      message: "Profile picture saved successfully",
      member: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save profile picture",
      error: error.message,
    });
  }
};

module.exports = {
  getMembers,
  addMember,
  saveManualFinancialRecord,
  importExcelFinancialRecords,
  updateMemberFinancialRecord,
  getMemberFinancials,
  updateMemberProfileImage,
};