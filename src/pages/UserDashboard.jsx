
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import getImageUrl from "../../components/getImageUrl";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardRes, restaurantRes] = await Promise.all([
        API.get("/dashboard/user"),
        API.get("/restaurants"),
      ]);

      setDashboard(dashboardRes.data);

      const restaurantData = restaurantRes.data;
      setRestaurants(
        Array.isArray(restaurantData)
          ? restaurantData
          : restaurantData.restaurants || []
      );
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        "Dashboard load nahi ho saka."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = dashboard?.statistics || {};

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderBooking = (booking) => (
    <div className="booking-card" key={booking._id}>
      <div>
        <h4>
          {booking.restaurantId?.name || "Restaurant"}
        </h4>

        <p>
          Table:{" "}
          {booking.tableId?.tableNumber || "N/A"}
        </p>

        <p>
          Date: {formatDate(booking.bookingDate)}
        </p>

        <p>
          Time: {booking.startTime || "N/A"}
        </p>

        <p>
          Guests: {booking.partySize}
        </p>
      </div>

      <span className={`booking-status ${booking.status}`}>
        {booking.status}
      </span>
    </div>
  );

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboard}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="user-dashboard">

      <aside className="dashboard-sidebar">
        <h2 className="dashboard-logo">FoodHub</h2>

        <nav>
          <button
            className={activeTab === "home" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            Dashboard
          </button>

          <button
            className={activeTab === "restaurants" ? "active" : ""}
            onClick={() => setActiveTab("restaurants")}
          >
            Explore Restaurants
          </button>

          <button
            className={activeTab === "bookings" ? "active" : ""}
            onClick={() => setActiveTab("bookings")}
          >
            My Bookings
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <h2>
              {activeTab === "home"
                ? "Dashboard"
                : activeTab === "restaurants"
                ? "Explore Restaurants"
                : "My Bookings"}
            </h2>

            <p>Welcome back, {dashboard?.user?.name || user?.name}!</p>
          </div>
        </header>

        {activeTab === "home" && (
          <>
            <section className="welcome-banner">
              <div>
                <h2>Good food, great moments!</h2>
                <p>
                  Discover restaurants and reserve your favourite table.
                </p>

                <button onClick={() => setActiveTab("restaurants")}>
                  Explore Restaurants
                </button>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalBookings || 0}</h3>
                <p>Total Bookings</p>
              </div>

              <div className="stat-card">
                <h3>{stats.pendingBookings || 0}</h3>
                <p>Pending</p>
              </div>

              <div className="stat-card">
                <h3>{stats.confirmedBookings || 0}</h3>
                <p>Confirmed</p>
              </div>

              <div className="stat-card">
                <h3>{stats.completedBookings || 0}</h3>
                <p>Completed</p>
              </div>

              <div className="stat-card">
                <h3>{stats.cancelledBookings || 0}</h3>
                <p>Cancelled</p>
              </div>

              <div className="stat-card">
                <h3>{stats.upcomingBookings || 0}</h3>
                <p>Upcoming</p>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-heading">
                <h2>Upcoming Bookings</h2>
                <button onClick={() => setActiveTab("bookings")}>
                  View All
                </button>
              </div>

              {dashboard?.upcomingBookings?.length > 0 ? (
                <div className="booking-list">
                  {dashboard.upcomingBookings.map(renderBooking)}
                </div>
              ) : (
                <p className="empty-message">
                  You don't have any upcoming bookings.
                </p>
              )}
            </section>

            <section className="dashboard-section">
              <h2>Recent Bookings</h2>

              {dashboard?.recentBookings?.length > 0 ? (
                <div className="booking-list">
                  {dashboard.recentBookings.map(renderBooking)}
                </div>
              ) : (
                <p className="empty-message">
                  No bookings found.
                </p>
              )}
            </section>
          </>
        )}

        {activeTab === "restaurants" && (
          <section className="restaurant-grid">
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <div className="restaurant-card" key={restaurant._id}>
                  <img
                    src={restaurant.imageUrl || "https://placehold.co/400x250?text=Restaurant"}
                    alt={restaurant.name}
                  />

                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine}</p>
                    <p>{restaurant.address}</p>

                    <button
                      onClick={() =>
                        navigate(`/restaurant/${restaurant._id}`)
                      }
                    >
                      View Restaurant
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">
                No restaurants available.
              </p>
            )}
          </section>
        )}

        {activeTab === "bookings" && (
          <section className="dashboard-section">
            <h2>All My Bookings</h2>

            {dashboard?.recentBookings?.length > 0 ? (
              <div className="booking-list">
                {dashboard.recentBookings.map(renderBooking)}
              </div>
            ) : (
              <p className="empty-message">
                You haven't made any bookings yet.
              </p>
            )}
          </section>
        )}

      </main>
    </div>
  );
};

export default UserDashboard;
