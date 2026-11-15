
const User = require("../models/user");
const Restaurant = require("../models/restaurants");
const Booking = require("../models/booking");
const Table = require("../models/tables");

// ===================================
// USER DASHBOARD
// ===================================

const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();

    const user = await User.findById(userId).select(
      "name email phone role"
    );

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    // Fetch booking statistics
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      rejectedBookings,
      upcomingBookings,
      recentBookings,
    ] = await Promise.all([

      Booking.countDocuments({
        customerId: userId,
      }),

      Booking.countDocuments({
        customerId: userId,
        status: "pending",
      }),

      Booking.countDocuments({
        customerId: userId,
        status: "confirmed",
      }),

      Booking.countDocuments({
        customerId: userId,
        status: "completed",
      }),

      Booking.countDocuments({
        customerId: userId,
        status: "cancelled",
      }),

      Booking.countDocuments({
        customerId: userId,
        status: "rejected",
      }),

      Booking.find({
        customerId: userId,
        status: { $in: ["pending", "confirmed"] },
        startTime: { $gte: currentDate },
      })
        .populate("restaurantId", "name imageUrl address")
        .populate("tableId", "tableNumber capacity")
        .sort({ startTime: 1 }),

      Booking.find({
        customerId: userId,
      })
        .populate("restaurantId", "name imageUrl address")
        .populate("tableId", "tableNumber capacity")
        .sort({ createdAt: -1 })
        .limit(5),

    ]);

    return res.status(200).json({
      message: "user dashboard fetched successfully",

      user,

      statistics: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        rejectedBookings,
        upcomingBookings: upcomingBookings.length,
      },

      upcomingBookings,

      recentBookings,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// ===================================
// OWNER DASHBOARD
// ===================================

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const owner = await User.findById(ownerId).select(
      "name email phone role"
    );

    if (!owner) {
      return res.status(404).json({
        message: "owner not found",
      });
    }

    // Fetch owner's restaurants
    const restaurants = await Restaurant.find({
      ownerId,
    }).select(
      "name imageUrl address cuisine status"
    );

    const restaurantIds = restaurants.map(
      (restaurant) => restaurant._id
    );

    // Fetch restaurant statistics
    const [
      totalRestaurants,
      approvedRestaurants,
      pendingRestaurants,
      rejectedRestaurants,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      rejectedBookings,
      totalTables,
      activeTables,
      inactiveTables,
      recentBookings,
      restaurantBookingStats,
    ] = await Promise.all([

      Restaurant.countDocuments({ ownerId }),

      Restaurant.countDocuments({
        ownerId,
        status: "approved",
      }),

      Restaurant.countDocuments({
        ownerId,
        status: "pending",
      }),

      Restaurant.countDocuments({
        ownerId,
        status: "rejected",
      }),

      Booking.countDocuments({
        restaurantId: { $in: restaurantIds },
      }),

      Booking.countDocuments({
        restaurantId: { $in: restaurantIds },
        status: "pending",
      }),

      Booking.countDocuments({
        restaurantId: { $in: restaurantIds },
        status: "confirmed",
      }),

      Booking.countDocuments({
        restaurantId: { $in: restaurantIds },
        status: "completed",
      }),

      Booking.countDocuments({
        restaurantId: { $in: restaurantIds },
        status: "cancelled",
      }),

      Booking.countDocuments({
        restaurantId: { $in: restaurantIds },
        status: "rejected",
      }),

      Table.countDocuments({
        restaurantId: { $in: restaurantIds },
      }),

      Table.countDocuments({
        restaurantId: { $in: restaurantIds },
        isActive: true,
      }),

      Table.countDocuments({
        restaurantId: { $in: restaurantIds },
        isActive: false,
      }),

      Booking.find({
        restaurantId: { $in: restaurantIds },
      })
        .populate("customerId", "name email phone")
        .populate("restaurantId", "name")
        .populate("tableId", "tableNumber capacity")
        .sort({ createdAt: -1 })
        .limit(10),

      // Restaurant-wise booking statistics
      Booking.aggregate([
        {
          $match: {
            restaurantId: { $in: restaurantIds },
          },
        },
        {
          $group: {
            _id: "$restaurantId",
            totalBookings: { $sum: 1 },

            pending: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "pending"] },
                  1,
                  0,
                ],
              },
            },

            confirmed: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "confirmed"] },
                  1,
                  0,
                ],
              },
            },

            completed: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "completed"] },
                  1,
                  0,
                ],
              },
            },

            cancelled: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "cancelled"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

    ]);

    // Attach booking statistics to each restaurant
    const restaurantsWithStats = restaurants.map(
      (restaurant) => {

        const stats = restaurantBookingStats.find(
          (item) =>
            item._id.toString() === restaurant._id.toString()
        );

        return {
          ...restaurant.toObject(),

          bookingStatistics: {
            totalBookings: stats?.totalBookings || 0,
            pending: stats?.pending || 0,
            confirmed: stats?.confirmed || 0,
            completed: stats?.completed || 0,
            cancelled: stats?.cancelled || 0,
          },
        };
      }
    );

    return res.status(200).json({
      message: "owner dashboard fetched successfully",

      owner,

      statistics: {
        totalRestaurants,
        approvedRestaurants,
        pendingRestaurants,
        rejectedRestaurants,

        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        rejectedBookings,

        totalTables,
        activeTables,
        inactiveTables,
      },

      restaurants: restaurantsWithStats,

      recentBookings,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  getUserDashboard,
  getOwnerDashboard,
};
