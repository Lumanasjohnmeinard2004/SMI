// server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "SMI Coop Backend API is running",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SMI Coop backend running on port ${PORT}`);
});