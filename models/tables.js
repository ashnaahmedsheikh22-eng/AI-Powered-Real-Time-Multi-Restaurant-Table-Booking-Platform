const mongoose = require("mongoose");

const tablesSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    tableNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Used for booking concurrency control
    bookingVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

tablesSchema.index(
  { restaurantId: 1, tableNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Table", tablesSchema);