
const mongoose = require("mongoose");

const Booking = require("../models/booking");
const Restaurant = require("../models/restaurants");
const Table = require("../models/tables");
const User = require("../models/user");

// CREATE BOOKING

const createBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const customerId = req.user.id;
    const { restaurantId, tableId } = req.params;
    const { partySize, bookingDate, startTime, endTime, notes } = req.body;

    if (!partySize || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        message: "Fill all required fields",
      });
    }

    // Combine booking date with time
    const datePart = String(bookingDate).split("T")[0];

    const start = new Date(`${datePart}T${startTime}:00`);
    const end = new Date(`${datePart}T${endTime}:00`);
    const date = new Date(`${datePart}T00:00:00`);

    if (
      !Number.isInteger(Number(partySize)) ||
      Number(partySize) < 1 ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      isNaN(date.getTime()) ||
      end <= start ||
      start <= new Date()
    ) {
      return res.status(400).json({
        message: "Invalid booking date or time",
      });
    }

    let booking;

    await session.withTransaction(async () => {
      const user = await User.findById(customerId).session(session);

      if (!user || user.role !== "user") {
        throw new Error("CUSTOMER_NOT_FOUND");
      }

      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        status: "approved",
      }).session(session);

      if (!restaurant) {
        throw new Error("RESTAURANT_NOT_FOUND");
      }

      const table = await Table.findOne({
        _id: tableId,
        restaurantId,
        isActive: true,
      }).session(session);

      if (!table) {
        throw new Error("TABLE_NOT_AVAILABLE");
      }

      if (Number(partySize) > table.capacity) {
        throw new Error("PARTY_SIZE_EXCEEDS_CAPACITY");
      }

      await Table.updateOne(
        { _id: tableId },
        { $inc: { bookingVersion: 1 } },
        { session }
      );

      const existingBooking = await Booking.findOne({
        tableId,
        status: { $in: ["pending", "confirmed"] },
        startTime: { $lt: end },
        endTime: { $gt: start },
      }).session(session);

      if (existingBooking) {
        throw new Error("TABLE_ALREADY_BOOKED");
      }

      const created = await Booking.create(
        [
          {
            customerId,
            restaurantId,
            tableId,
            partySize: Number(partySize),
            bookingDate: date,
            startTime: start,
            endTime: end,
            notes,
          },
        ],
        { session }
      );

      booking = created[0];
    });

    return res.status(201).json({
      message: "Booking created successfully",
      receipt: booking,
    });

  } catch (error) {
    const messages = {
      CUSTOMER_NOT_FOUND: [404, "Customer not found"],
      RESTAURANT_NOT_FOUND: [404, "Approved restaurant not found"],
      TABLE_NOT_AVAILABLE: [404, "Table not available"],
      PARTY_SIZE_EXCEEDS_CAPACITY: [400, "Party size exceeds table capacity"],
      TABLE_ALREADY_BOOKED: [409, "Table is already booked"],
    };

    if (messages[error.message]) {
      const [status, message] = messages[error.message];
      return res.status(status).json({ message });
    }

    return res.status(500).json({
      message: error.message,
    });

  } finally {
    await session.endSession();
  }
};


// CUSTOMER: GET MY BOOKINGS
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.user.id,
    })
      .populate("restaurantId")
      .populate("tableId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "your bookings fetched successfully",
      total: bookings.length,
      bookings,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// CUSTOMER: CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "booking not found",
      });
    }

    if (["cancelled", "rejected", "completed"].includes(booking.status)) {
      return res.status(400).json({
        message: "booking cannot be cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "booking cancelled successfully",
      booking,
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


// OWNER: GET RESTAURANT BOOKINGS
const getRestaurantBookings = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "restaurant not found",
      });
    }

    const bookings = await Booking.find({ restaurantId })
      .populate("customerId", "name email phone")
      .populate("tableId")
      .sort({ bookingDate: 1, startTime: 1 });

    return res.status(200).json({
      message: "restaurant bookings fetched successfully",
      total: bookings.length,
      bookings,
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


// OWNER: CONFIRM BOOKING
const confirmedBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "booking not found",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: booking.restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({
        message: "you cannot manage this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "only pending bookings can be confirmed",
      });
    }

    booking.status = "confirmed";
    await booking.save();

    return res.status(200).json({
      message: "booking confirmed successfully",
      booking,
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


// OWNER: REJECT BOOKING
const rejectedBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "booking not found",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: booking.restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({
        message: "you cannot manage this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "only pending bookings can be rejected",
      });
    }

    booking.status = "rejected";
    await booking.save();

    return res.status(200).json({
      message: "booking rejected successfully",
      booking,
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


// OWNER: COMPLETE BOOKING
const completedBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "booking not found",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: booking.restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({
        message: "you cannot manage this booking",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "only confirmed bookings can be completed",
      });
    }

    booking.status = "completed";
    await booking.save();

    return res.status(200).json({
      message: "booking completed successfully",
      booking,
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


module.exports = {
  createBooking,
  cancelBooking,
  confirmedBooking,
  completedBooking,
  rejectedBooking,
  getMyBookings,
  getRestaurantBookings,
};
