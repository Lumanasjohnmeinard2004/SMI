// controllers/memberController.js

 

const bcrypt = require("bcryptjs");

const pool = require("../db");

 

const {

  recordBalanceChanges,

} = require("./transactionController");

 

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

 

function getCurrentMonth() {

  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

 

  return `${year}-${month}`;

}

 

function cleanMonth(value) {

  const currentMonth = getCurrentMonth();

 

  if (!value) {

    return currentMonth;

  }

 

  const cleaned = String(value).trim();

 

  if (!/^\d{4}-\d{2}$/.test(cleaned)) {

    return currentMonth;

  }

 

  return cleaned;

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

 

async function saveMonthlySnapshot(memberId, data, client = pool) {

  const recordMonth = cleanMonth(data.record_month);

 

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

      recordMonth,

 

      toNumber(data.share_capital),

      toNumber(data.savings),

      toNumber(data.special_savings),

 

      toNumber(data.regular_loan),

      toNumber(data.regular_loan_diminishing),

      toNumber(data.educational_loan),

      toNumber(data.educational_loan_diminishing),

      toNumber(data.short_term_loan),

      toNumber(data.short_term_loan_diminishing),

      toNumber(data.appliance_loan),

      toNumber(data.appliance_loan_diminishing),

      toNumber(data.medical_loan),

      toNumber(data.medical_loan_diminishing),

      toNumber(data.petty_cash_loan),

      toNumber(data.vehicle_loan),

      toNumber(data.inter_trading_loan),

 

      toNumber(data.dividend_amount),

    ]

  );

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

 

const financialFieldNames = [

  "share_capital",

  "savings",

  "special_savings",

  "dividend_amount",

 

  "regular_loan",

  "regular_loan_diminishing",

  "educational_loan",

  "educational_loan_diminishing",

  "short_term_loan",

  "short_term_loan_diminishing",

  "appliance_loan",

  "appliance_loan_diminishing",

  "medical_loan",

  "medical_loan_diminishing",

  "petty_cash_loan",

  "vehicle_loan",

  "inter_trading_loan",

];

 

function emptyFinancialRecord() {

  const record = {};

 

  financialFieldNames.forEach((field) => {

    record[field] = 0;

  });

 

  return record;

}

 

async function getRawFinancialRecord(memberId, client = pool) {

  const result = await client.query(

    `

    SELECT ${financialFieldNames.join(", ")}

    FROM member_financials

    WHERE member_id = $1

    LIMIT 1

    `,

    [memberId]

  );

 

  return result.rows[0] || emptyFinancialRecord();

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

        m.profile_image,

        m.created_at,

        m.company,

        m.email,

        m.phone,

        m.address,

        COALESCE(m.branch, 'Main Branch') AS branch,

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

      RETURNING id, member_id, full_name, username, status, profile_image, created_at, company, email, phone, address, COALESCE(branch, 'Main Branch') AS branch

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

 

    await saveMonthlySnapshot(member.id, {});

 

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

        m.company,

        m.email,

        m.phone,

        m.address,

        COALESCE(m.branch, 'Main Branch') AS branch,

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

      record_month,

 

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

 

    const oldFinancialRecord = await getRawFinancialRecord(member.id);

 

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

 

    const currentRecord = financialResult.rows[0];

 

    const createdTransactions = await recordBalanceChanges(

      member,

      oldFinancialRecord,

      currentRecord,

      {

        source: "Manual Financial Record",

        record_month: cleanMonth(record_month),

        remarks: "Manual financial record added by admin.",

      }

    );

 

    await saveMonthlySnapshot(member.id, {

      record_month,

 

      share_capital: currentRecord.share_capital,

      savings: currentRecord.savings,

      special_savings: currentRecord.special_savings,

 

      regular_loan: currentRecord.regular_loan,

      regular_loan_diminishing: currentRecord.regular_loan_diminishing,

      educational_loan: currentRecord.educational_loan,

      educational_loan_diminishing: currentRecord.educational_loan_diminishing,

      short_term_loan: currentRecord.short_term_loan,

      short_term_loan_diminishing: currentRecord.short_term_loan_diminishing,

      appliance_loan: currentRecord.appliance_loan,

      appliance_loan_diminishing: currentRecord.appliance_loan_diminishing,

      medical_loan: currentRecord.medical_loan,

      medical_loan_diminishing: currentRecord.medical_loan_diminishing,

      petty_cash_loan: currentRecord.petty_cash_loan,

      vehicle_loan: currentRecord.vehicle_loan,

      inter_trading_loan: currentRecord.inter_trading_loan,

 

      dividend_amount: currentRecord.dividend_amount,

    });

 

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

        m.company,

        m.email,

        m.phone,

        m.address,

        COALESCE(m.branch, 'Main Branch') AS branch,

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

      financial_record: currentRecord,

      member: updatedMemberResult.rows[0],

      created_transactions: createdTransactions,

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

    const { records, record_month } = req.body;

 

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

    let createdTransactionCount = 0;

 

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

 

      const oldFinancialRecord = await getRawFinancialRecord(member.id, client);

 

      const updatedFinancialResult = await client.query(

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

        RETURNING *

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

 

      const newFinancialRecord = updatedFinancialResult.rows[0];

 

      const createdTransactions = await recordBalanceChanges(

        member,

        oldFinancialRecord,

        newFinancialRecord,

        {

          source: "Excel Import",

          record_month: cleanMonth(row.record_month || record_month),

          remarks: "Financial record imported from Excel.",

        },

        client

      );

 

      createdTransactionCount += createdTransactions.length;

 

      await saveMonthlySnapshot(

        member.id,

        {

          record_month: row.record_month || record_month,

 

          share_capital: row.share_capital,

          savings: row.savings,

          special_savings: row.special_savings,

 

          regular_loan: row.regular_loan,

          regular_loan_diminishing: row.regular_loan_diminishing,

          educational_loan: row.educational_loan,

          educational_loan_diminishing: row.educational_loan_diminishing,

          short_term_loan: row.short_term_loan,

          short_term_loan_diminishing: row.short_term_loan_diminishing,

          appliance_loan: row.appliance_loan,

          appliance_loan_diminishing: row.appliance_loan_diminishing,

          medical_loan: row.medical_loan,

          medical_loan_diminishing: row.medical_loan_diminishing,

          petty_cash_loan: row.petty_cash_loan,

          vehicle_loan: row.vehicle_loan,

          inter_trading_loan: row.inter_trading_loan,

 

          dividend_amount: row.dividend_amount,

        },

        client

      );

    }

 

    await client.query("COMMIT");

 

    res.json({

      message: "Excel records imported successfully",

      created_count: createdCount,

      updated_count: updatedCount,

      skipped_count: skippedCount,

      created_transaction_count: createdTransactionCount,

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

      record_month,

 

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

 

    const oldFinancialRecord = await getRawFinancialRecord(member.id);

 

    const updatedFinancialResult = await pool.query(

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

      RETURNING *

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

 

    const newFinancialRecord = updatedFinancialResult.rows[0];

 

    const createdTransactions = await recordBalanceChanges(

      {

        id: member.id,

        member_id: member_id.trim(),

        full_name: full_name.trim(),

        username: username.trim(),

      },

      oldFinancialRecord,

      newFinancialRecord,

      {

        source: "Member Financial Update",

        record_month: cleanMonth(record_month),

        remarks: "Member financial record updated by admin.",

      }

    );

 

    await saveMonthlySnapshot(member.id, {

      record_month,

 

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

    });

 

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

        m.company,

        m.email,

        m.phone,

        m.address,

        COALESCE(m.branch, 'Main Branch') AS branch,

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

      created_transactions: createdTransactions,

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

        m.company,

        m.email,

        m.phone,

        m.address,

        COALESCE(m.branch, 'Main Branch') AS branch,

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

 

const getMemberMonthlyFinancials = async (req, res) => {

  try {

    const { identifier } = req.params;

    const { month } = req.query;

 

    const memberResult = await pool.query(

      `

      SELECT id, member_id, full_name, username, status, profile_image, created_at, company, email, phone, address, COALESCE(branch, 'Main Branch') AS branch

      FROM members

      WHERE id::TEXT = $1 OR member_id = $1 OR username = $1

      LIMIT 1

      `,

      [identifier]

    );

 

    if (memberResult.rows.length === 0) {

      return res.status(404).json({

        message: "Member not found",

      });

    }

 

    const member = memberResult.rows[0];

 

    const monthsResult = await pool.query(

      `

      SELECT DISTINCT record_month

      FROM member_monthly_financials

      WHERE member_id = $1

      ORDER BY record_month DESC

      `,

      [member.id]

    );

 

    const selectedMonth =

      month || monthsResult.rows[0]?.record_month || getCurrentMonth();

 

    const recordResult = await pool.query(

      `

      SELECT *

      FROM member_monthly_financials

      WHERE member_id = $1

      AND record_month = $2

      LIMIT 1

      `,

      [member.id, selectedMonth]

    );

 

    res.json({

      member,

      selected_month: selectedMonth,

      available_months: monthsResult.rows.map((row) => row.record_month),

      financial_record: recordResult.rows[0] || null,

    });

  } catch (error) {

    res.status(500).json({

      message: "Failed to fetch monthly financial records",

      error: error.message,

    });

  }

};

 

const updateMemberContact = async (req, res) => {

  try {

    const { identifier } = req.params;

    const { email, phone, address, branch } = req.body;

 

    const cleanedEmail = String(email || "").trim();

    const cleanedPhone = String(phone || "").trim();

    const cleanedAddress = String(address || "").trim();

    const cleanedBranch = String(branch || "Main Branch").trim() || "Main Branch";

 

    if (cleanedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {

      return res.status(400).json({

        message: "Please enter a valid email address",

      });

    }

 

    if (cleanedPhone && !/^[0-9+()\-\s]{7,30}$/.test(cleanedPhone)) {

      return res.status(400).json({

        message: "Please enter a valid phone number",

      });

    }

 

    const result = await pool.query(

      `

      UPDATE members

      SET

        email = NULLIF($1, ''),

        phone = NULLIF($2, ''),

        address = NULLIF($3, ''),

        branch = $4

      WHERE id::TEXT = $5 OR member_id = $5 OR username = $5

      RETURNING

        id,

        member_id,

        full_name,

        username,

        status,

        profile_image,

        created_at,

        company,

        email,

        phone,

        address,

        COALESCE(branch, 'Main Branch') AS branch

      `,

      [

        cleanedEmail,

        cleanedPhone,

        cleanedAddress,

        cleanedBranch,

        String(identifier).trim(),

      ]

    );

 

    if (result.rows.length === 0) {

      return res.status(404).json({

        message: "Member not found",

      });

    }

 

    res.json({

      message: "Contact information updated successfully",

      member: result.rows[0],

    });

  } catch (error) {

    res.status(500).json({

      message: "Failed to update contact information",

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

      RETURNING id, member_id, full_name, username, status, profile_image, created_at, company, email, phone, address, COALESCE(branch, 'Main Branch') AS branch

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

  getMemberMonthlyFinancials,

  updateMemberContact,

  updateMemberProfileImage,

};