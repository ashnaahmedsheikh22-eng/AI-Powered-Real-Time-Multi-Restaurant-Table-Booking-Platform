const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createTable,
  updateTableStatus,
  deleteTable,
  getAvailableTables,
  getOwnerTables,
  updateTable,
} = require("../controllers/tableController");

// Customer: check available tables
router.get(
  "/:restaurantId/available",
  authMiddleware,
  roleMiddleware("user"),
  getAvailableTables
);

// Owner-only routes
router.use(authMiddleware, roleMiddleware("owner"));

router.get("/:restaurantId/my-tables", getOwnerTables);

router.post("/:restaurantId", createTable);

router.put("/:restaurantId/:id", updateTable);

router.patch("/:restaurantId/:id", updateTableStatus);

router.delete("/:restaurantId/:id", deleteTable);

module.exports = router;