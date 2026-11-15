
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "./MyBookings.css";

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/my-bookings");
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.log("Booking error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to fetch bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      const res = await API.patch(
        `/bookings/${bookingId}/cancel`
      );

      alert(res.data.message || "Booking cancelled successfully");

      fetchBookings();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to cancel booking"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancel = (status) => {
    return ["pending", "confirmed"].includes(
      status?.toLowerCase()
    );
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="my-bookings-page">
        <section className="bookings-header">
          <span>YOUR DINING EXPERIENCE</span>
          <h1>My Bookings</h1>
          <p>
            Manage your reservations and keep track of your bookings.
          </p>
        </section>

        <section className="bookings-container">
          <div className="bookings-title">
            <div>
              <h2>Your Reservations</h2>
              <p>
                {bookings.length} total bookings
              </p>
            </div>

            <button
              onClick={() => navigate("/restaurants")}
            >
              Explore Restaurants
            </button>
          </div>

          {loading ? (
            <p className="bookings-message">
              Loading your bookings...
            </p>
          ) : bookings.length > 0 ? (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div
                  className="booking-item"
                  key={booking._id}
                >
                  <div className="booking-item-top">
                    <div>
                      <span className="booking-label">
                        RESTAURANT
                      </span>

                      <h3>
                        {booking.restaurantId?.name ||
                          "Restaurant unavailable"}
                      </h3>
                    </div>

                    <span
                      className={`booking-status ${booking.status?.toLowerCase()}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="booking-details-grid">
                    <div>
                      <span>Booking Date</span>
                      <strong>
                        {formatDate(booking.bookingDate)}
                      </strong>
                    </div>

                    <div>
                      <span>Start Time</span>
                      <strong>
                        {formatTime(booking.startTime)}
                      </strong>
                    </div>

                    <div>
                      <span>End Time</span>
                      <strong>
                        {formatTime(booking.endTime)}
                      </strong>
                    </div>

                    <div>
                      <span>Party Size</span>
                      <strong>
                        {booking.partySize} People
                      </strong>
                    </div>

                    <div>
                      <span>Table</span>
                      <strong>
                        {booking.tableId?.tableNumber
                          ? `Table ${booking.tableId.tableNumber}`
                          : "Not available"}
                      </strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>
                        {booking.restaurantId?.address ||
                          "Not available"}
                      </strong>
                    </div>
                  </div>

                  {canCancel(booking.status) && (
                    <div className="booking-actions">
                      <button
                        onClick={() =>
                          cancelBooking(booking._id)
                        }
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-bookings">
              <h3>No Bookings Yet</h3>

              <p>
                You haven't made any restaurant reservations.
                Explore restaurants and book your first table.
              </p>

              <button
                onClick={() => navigate("/restaurants")}
              >
                Explore Restaurants
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default MyBookings;