
const Restaurant = require("../models/restaurants");
const fs = require("fs");
const path = require("path");
const Table = require("../models/tables");
const Booking = require("../models/booking");

// CREATE RESTAURANT
const createRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine, address, phone } = req.body;

    let timeData;

    try {
      const rawTime = req.body.openingClosingTime;
      timeData =
        typeof rawTime === "string" ? JSON.parse(rawTime) : rawTime;
    } catch (error) {
      return res.status(400).json({
        message: "Invalid opening and closing time format",
      });
    }

    const isValidTime = (time) =>
      typeof time === "string" &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

    if (
      !isValidTime(timeData?.openingTime) ||
      !isValidTime(timeData?.closingTime)
    ) {
      return res.status(400).json({
        message: "Invalid opening and closing time",
      });
    }

    if (
      !name?.trim() ||
      !description?.trim() ||
      !cuisine?.trim() ||
      !address?.trim() ||
      !phone?.trim()
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload restaurant image",
      });
    }

    const restaurant = await Restaurant.create({
      ownerId: req.user.id,
      name: name.trim(),
      description: description.trim(),
      cuisine: cuisine.trim(),
      address: address.trim(),
      phone: phone.trim(),

      openingClosingTime: {
        openingTime: timeData.openingTime,
        closingTime: timeData.closingTime,
      },

      imageUrl: `/uploads/${req.file.filename}`,
    });

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    console.log("CREATE RESTAURANT ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};



// GET ALL APPROVED RESTAURANTS
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      status: "approved",
    }).populate("ownerId", "name email");

    return res.status(200).json({
      message: "Restaurants fetched successfully",
      total: restaurants.length,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE RESTAURANT
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: id,
      status: "approved",
    }).populate("ownerId", "name");

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      message: "Restaurant fetched successfully",
      restaurant,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET OWNER RESTAURANTS
const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      ownerId: req.user.id,
    });

    return res.status(200).json({
      message: "Your restaurants fetched successfully",
      total: restaurants.length,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE RESTAURANT
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: id,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const {
      name,
      description,
      cuisine,
      address,
      phone,
      openingClosingTime,
    } = req.body;

    if (name !== undefined) restaurant.name = name.trim();
    if (description !== undefined) restaurant.description = description.trim();
    if (cuisine !== undefined) restaurant.cuisine = cuisine.trim();
    if (address !== undefined) restaurant.address = address.trim();
    if (phone !== undefined) restaurant.phone = phone.trim();

    if (openingClosingTime !== undefined) {
      let timeData;

      try {
        timeData =
          typeof openingClosingTime === "string"
            ? JSON.parse(openingClosingTime)
            : openingClosingTime;
      } catch (error) {
        return res.status(400).json({
          message: "Invalid opening and closing time",
        });
      }

      const isValidTime = (time) =>
        typeof time === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

      if (
        !isValidTime(timeData?.openingTime) ||
        !isValidTime(timeData?.closingTime)
      ) {
        return res.status(400).json({
          message: "Invalid opening and closing time",
        });
      }

      restaurant.openingClosingTime = timeData;
    }

    if (req.file) {
      // Delete old local image
      if (restaurant.imageUrl) {
        const oldPath = path.join(
          __dirname,
          "..",
          restaurant.imageUrl.replace(/^\/+/, "")
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      restaurant.imageUrl = `/uploads/${req.file.filename}`;
    }

    await restaurant.save();

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE RESTAURANT
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: id,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const activeBooking = await Booking.findOne({
      restaurantId: id,
      status: { $in: ["pending", "confirmed"] },
      endTime: { $gt: new Date() },
    });

    if (activeBooking) {
      return res.status(409).json({
        message: "Restaurant has active bookings and cannot be deleted",
      });
    }

    await Table.deleteMany({ restaurantId: id });
    await Restaurant.deleteOne({ _id: id });

    if (restaurant.imageUrl) {
      const imagePath = path.join(
        __dirname,
        "..",
        restaurant.imageUrl.replace(/^\/+/, "")
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    return res.status(200).json({
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    return res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurants,
  updateRestaurant,
  deleteRestaurant,
};
