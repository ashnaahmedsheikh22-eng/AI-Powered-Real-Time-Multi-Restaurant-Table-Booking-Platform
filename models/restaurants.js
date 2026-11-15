
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    cuisine: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    openingClosingTime: {
      openingTime: {
        type: String,
        required: true,
      },
      closingTime: {
        type: String,
        required: true,
      },
    },

    imageUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "notApproved"],
      default: "approved",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
