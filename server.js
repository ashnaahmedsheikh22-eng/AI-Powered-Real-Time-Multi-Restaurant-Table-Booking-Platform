
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dns = require("dns");
const path = require("path");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDb = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARES
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// LOCAL IMAGE STORAGE
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ROUTES
const authRoutes = require("./routes/authRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const tableRoutes = require("./routes/tableRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

// HOME
app.get("/", (req, res) => {
  res.send("Server is running");
});

// START SERVER
const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
