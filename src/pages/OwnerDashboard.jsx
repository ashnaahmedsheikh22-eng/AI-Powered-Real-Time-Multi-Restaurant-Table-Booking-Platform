import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import getImageUrl from "../../components/getImageUrl";

import "./OwnerDashboard.css";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "owner") {
      navigate("/");
      return;
    }

    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard/owner");
      setDashboard(res.data);
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message || "Unable to load owner dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // CONFIRM / REJECT / COMPLETE BOOKING
  const updateBooking = async (bookingId, action) => {
    if (
      action === "reject" &&
      !window.confirm("Are you sure you want to reject this booking?")
    ) {
      return;
    }

    try {
      setActionId(bookingId);

      const res = await API.patch(`/bookings/${bookingId}/${action}`);

      alert(res.data.message || "Booking updated successfully");

      await fetchDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to update booking"
      );
    } finally {
      setActionId(null);
    }
  };

  // Safe date formatter
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Safe time formatter
  const formatTime = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const stats = dashboard?.statistics;

  const statCards = [
    {
      title: "Total Restaurants",
      value: stats?.totalRestaurants || 0,
      icon: "🏢",
    },
    {
      title: "Approved Restaurants",
      value: stats?.approvedRestaurants || 0,
      icon: "✓",
    },
    {
      title: "Pending Restaurants",
      value: stats?.pendingRestaurants || 0,
      icon: "◷",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: "📅",
    },
    {
      title: "Pending Bookings",
      value: stats?.pendingBookings || 0,
      icon: "⌛",
    },
    {
      title: "Confirmed Bookings",
      value: stats?.confirmedBookings || 0,
      icon: "✓",
    },
    {
      title: "Total Tables",
      value: stats?.totalTables || 0,
      icon: "▦",
    },
    {
      title: "Active Tables",
      value: stats?.activeTables || 0,
      icon: "●",
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="owner-loading">Loading dashboard...</p>
        <Footer />
      </>
    );
  }

  if (!dashboard) {
    return (
      <>
        <Navbar />
        <p className="owner-loading">Dashboard data could not be loaded.</p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="owner-dashboard">
        <section className="owner-welcome">
          <div>
            <span>OWNER PANEL</span>
            <h1>Welcome, {dashboard.owner?.name || "Owner"}</h1>
            <p>
              Manage your restaurants, tables and reservations from one
              place.
            </p>
          </div>

          <button onClick={() => navigate("/owner/add-restaurant")}>
            + Add Restaurant
          </button>
        </section>

        {/* STATISTICS */}

        <section className="owner-stats-section">
          <div className="owner-section-heading">
            <h2>Overview</h2>
            <p>Your restaurant business at a glance</p>
          </div>

          <div className="owner-stats-grid">
            {statCards.map((stat) => (
              <div className="owner-stat-card" key={stat.title}>
                <div className="owner-stat-top">
                  <span>{stat.title}</span>
                  <span className="owner-stat-icon">{stat.icon}</span>
                </div>

                <h3>{stat.value}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* RESTAURANTS */}

        <section className="owner-section">
          <div className="owner-section-heading owner-heading-row">
            <div>
              <h2>My Restaurants</h2>
              <p>Manage your registered restaurants</p>
            </div>

            <button onClick={() => navigate("/owner/restaurants")}>
              View All
            </button>
          </div>

          {dashboard.restaurants?.length > 0 ? (
            <div className="owner-restaurants-grid">
              {dashboard.restaurants.map((restaurant) => (
                <div className="owner-restaurant-card" key={restaurant._id}>
                  <img
                    src={getImageUrl(
                      restaurant.imageUrl,
                      "https://placehold.co/600x350?text=Restaurant"
                    )}
                    alt={restaurant.name}
                  />

                  <div className="owner-restaurant-content">
                    <span
                      className={`restaurant-status ${restaurant.status}`}
                    >
                      {restaurant.status}
                    </span>

                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine}</p>

                    <p className="owner-restaurant-address">
                      {restaurant.address}
                    </p>

                    <div className="restaurant-booking-count">
                      <strong>
                        {restaurant.bookingStatistics?.totalBookings || 0}
                      </strong>
                      <span>Total Bookings</span>
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/owner/restaurants/${restaurant._id}/tables`
                        )
                      }
                    >
                      Manage Tables
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="owner-empty">
              <h3>No Restaurants Added</h3>
              <p>Add your first restaurant to get started.</p>

              <button onClick={() => navigate("/owner/add-restaurant")}>
                Add Restaurant
              </button>
            </div>
          )}
        </section>

        {/* RECENT BOOKINGS */}

        <section className="owner-section">
          <div className="owner-section-heading">
            <h2>Recent Bookings</h2>
            <p>Confirm, reject or complete reservations</p>
          </div>

          {dashboard.recentBookings?.length > 0 ? (
            <div className="owner-table-wrapper">
              <table className="owner-bookings-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Restaurant</th>
                    <th>Table</th>
                    <th>Party Size</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recentBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.customerId?.name || "Customer"}</td>

                      <td>{booking.restaurantId?.name || "Restaurant"}</td>

                      <td>
                        {booking.tableId?.tableNumber
                          ? `Table ${booking.tableId.tableNumber}`
                          : "N/A"}
                      </td>

                      <td>{booking.partySize}</td>

                      <td>{formatDate(booking.bookingDate)}</td>

                      <td>
                        {booking.startTime
                          ? `${formatTime(booking.startTime)} - ${formatTime(
                              booking.endTime
                            )}`
                          : "N/A"}
                      </td>

                      <td>
                        <span className={`booking-status ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>

                      <td>
                        <div className="booking-action-buttons">
                          {booking.status === "pending" && (
                            <>
                              <button
                                className="confirm-booking-action"
                                disabled={actionId === booking._id}
                                onClick={() =>
                                  updateBooking(booking._id, "confirm")
                                }
                              >
                                Confirm
                              </button>

                              <button
                                className="reject-booking-action"
                                disabled={actionId === booking._id}
                                onClick={() =>
                                  updateBooking(booking._id, "reject")
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {booking.status === "confirmed" && (
                            <button
                              className="complete-booking-action"
                              disabled={actionId === booking._id}
                              onClick={() =>
                                updateBooking(booking._id, "complete")
                              }
                            >
                              Complete
                            </button>
                          )}

                          {!["pending", "confirmed"].includes(
                            booking.status
                          ) && <span className="no-action">No action</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="owner-empty">
              <p>No bookings available yet.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default OwnerDashboard;