
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getUserDashboard,
  getOwnerDashboard,
} = require("../controllers/dashboardController");

// USER DASHBOARD
router.get(
  "/user",
  authMiddleware,
  roleMiddleware("user"),
  getUserDashboard
);

// OWNER DASHBOARD
router.get(
  "/owner",
  authMiddleware,
  roleMiddleware("owner"),
  getOwnerDashboard
);

module.exports = router;
