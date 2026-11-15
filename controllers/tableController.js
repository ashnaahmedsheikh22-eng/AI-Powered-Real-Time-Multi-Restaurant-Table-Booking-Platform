const Table = require("../models/tables");
const Restaurant = require("../models/restaurants");
const Booking = require("../models/booking");

// CREATE TABLE
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const { restaurantId } = req.params;

    if (!tableNumber || !capacity) {
      return res.status(400).json({
        message: "fill all required fields",
      });
    }

    if (
      !Number.isInteger(Number(tableNumber)) ||
      Number(tableNumber) < 1 ||
      !Number.isInteger(Number(capacity)) ||
      Number(capacity) < 1
    ) {
      return res.status(400).json({
        message: "invalid table number or capacity",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "restaurant not found",
      });
    }

    const table = await Table.create({
      restaurantId,
      tableNumber: Number(tableNumber),
      capacity: Number(capacity),
    });

    return res.status(201).json({
      message: "table created successfully",
      table,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "table number already exists in this restaurant",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "invalid id" });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE TABLE STATUS
const updateTableStatus = async (req, res) => {
  try {
    const { restaurantId, id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "restaurant not found",
      });
    }

    const table = await Table.findOneAndUpdate(
      {
        _id: id,
        restaurantId: restaurant._id,
      },
      { isActive },
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({
        message: "table not found",
      });
    }

    return res.status(200).json({
      message: "table status updated successfully",
      table,
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "invalid id" });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE TABLE
const deleteTable = async (req, res) => {
  try {
    const { restaurantId, id } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "restaurant not found",
      });
    }

    const table = await Table.findOne({
      _id: id,
      restaurantId: restaurant._id,
    });

    if (!table) {
      return res.status(404).json({
        message: "table not found",
      });
    }

    const activeBooking = await Booking.findOne({
      tableId: id,
      status: { $in: ["pending", "confirmed"] },
      endTime: { $gt: new Date() },
    });

    if (activeBooking) {
      return res.status(409).json({
        message: "table has active bookings and cannot be deleted",
      });
    }

    await Table.deleteOne({ _id: id });

    return res.status(200).json({
      message: "table deleted successfully",
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "invalid id" });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// CUSTOMER: GET AVAILABLE TABLES
const getAvailableTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { bookingDate, startTime, endTime, partySize } = req.query;

    if (!bookingDate || !startTime || !endTime || !partySize) {
      return res.status(400).json({
        message: "provide booking date, start time, end time and party size",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const date = new Date(bookingDate);
    const size = Number(partySize);

    if (
      !Number.isInteger(size) ||
      size < 1 ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      isNaN(date.getTime()) ||
      end <= start ||
      start <= new Date()
    ) {
      return res.status(400).json({
        message: "invalid booking details",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      status: "approved",
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "approved restaurant not found",
      });
    }

    // Get active tables with enough capacity
    const tables = await Table.find({
      restaurantId,
      isActive: true,
      capacity: { $gte: size },
    });

    // Find overlapping bookings
    const bookedTables = await Booking.find({
      restaurantId,
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).distinct("tableId");

    // Remove already booked tables
    const availableTables = tables.filter(
      (table) =>
        !bookedTables.some(
          (bookedId) => bookedId.toString() === table._id.toString()
        )
    );

    return res.status(200).json({
      message: "available tables fetched successfully",
      total: availableTables.length,
      tables: availableTables,
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "invalid restaurant id",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};


// OWNER: GET TABLES OF MY RESTAURANT
const getOwnerTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 });

    return res.status(200).json({
      message: "tables fetched successfully",
      total: tables.length,
      restaurant: { _id: restaurant._id, name: restaurant.name },
      tables,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "invalid id" });
    }
    return res.status(500).json({ message: error.message });
  }
};

// OWNER: EDIT TABLE (number / capacity)
const updateTable = async (req, res) => {
  try {
    const { restaurantId, id } = req.params;
    const { tableNumber, capacity } = req.body;

    if (
      !Number.isInteger(Number(tableNumber)) ||
      Number(tableNumber) < 1 ||
      !Number.isInteger(Number(capacity)) ||
      Number(capacity) < 1
    ) {
      return res.status(400).json({
        message: "invalid table number or capacity",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    // Capacity kam karne se pehle upcoming bookings check karein
    const conflictingBooking = await Booking.findOne({
      tableId: id,
      status: { $in: ["pending", "confirmed"] },
      endTime: { $gt: new Date() },
      partySize: { $gt: Number(capacity) },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: "an upcoming booking has a larger party size than this capacity",
      });
    }

    const table = await Table.findOneAndUpdate(
      { _id: id, restaurantId: restaurant._id },
      { tableNumber: Number(tableNumber), capacity: Number(capacity) },
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ message: "table not found" });
    }

    return res.status(200).json({
      message: "table updated successfully",
      table,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "table number already exists in this restaurant",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "invalid id" });
    }

    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getOwnerTables,
  getAvailableTables
};