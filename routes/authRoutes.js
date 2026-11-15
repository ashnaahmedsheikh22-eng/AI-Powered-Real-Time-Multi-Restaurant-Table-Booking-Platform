
const express = require("express");
const router = express.Router();

const { register, userLogin } = require("../controllers/userController");

// Public routes
router.post("/register", register);
router.post("/login", userLogin);

module.exports = router;