const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createBooking,
  cancelBooking,
  confirmedBooking,
  completedBooking,
  rejectedBooking,
  getMyBookings,
  getRestaurantBookings,
} = require("../controllers/bookingController");

// All booking routes require login
router.use(authMiddleware);

// Customer routes
router.post(
  "/:restaurantId/:tableId",
  roleMiddleware("user"),
  createBooking
);

router.get(
  "/my-bookings",
  roleMiddleware("user"),
  getMyBookings
);

router.patch(
  "/:bookingId/cancel",
  roleMiddleware("user"),
  cancelBooking
);

// Owner routes
router.get(
  "/restaurant/:restaurantId",
  roleMiddleware("owner"),
  getRestaurantBookings
);

router.patch(
  "/:bookingId/confirm",
  roleMiddleware("owner"),
  confirmedBooking
);

router.patch(
  "/:bookingId/reject",
  roleMiddleware("owner"),
  rejectedBooking
);

router.patch(
  "/:bookingId/complete",
  roleMiddleware("owner"),
  completedBooking
);

module.exports = router;