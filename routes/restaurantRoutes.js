
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurants,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

// OWNER RESTAURANTS
router.get(
  "/my-restaurants",
  authMiddleware,
  roleMiddleware("owner"),
  getMyRestaurants
);

// PUBLIC ROUTES
router.get("/", getAllRestaurants);

router.get("/:id", getRestaurantById);

// CREATE RESTAURANT
router.post(
  "/",
  authMiddleware,
  roleMiddleware("owner"),
  upload.single("image"),
  createRestaurant
);

// UPDATE RESTAURANT
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("owner"),
  upload.single("image"),
  updateRestaurant
);

// DELETE RESTAURANT
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("owner"),
  deleteRestaurant
);

module.exports = router;
