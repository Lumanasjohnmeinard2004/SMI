// routes/authRoutes.js

const express = require("express");

const {
  registerAdmin,
  registerMember,
  loginAdmin,
  loginMember,
} = require("../controllers/authController");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Auth route working",
  });
});

router.post("/register-admin", registerAdmin);
router.post("/register-member", registerMember);
router.post("/login-admin", loginAdmin);
router.post("/login-member", loginMember);

module.exports = router;