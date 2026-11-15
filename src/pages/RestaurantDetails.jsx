import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import getImageUrl from "../../components/getImageUrl";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "./RestaurantDetail.css";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    partySize: 2,
    notes: "",
  });

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const res = await API.get(`/restaurants/${id}`);
      setRestaurant(res.data.restaurant);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to load restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setTables([]);
    setSelectedTable("");
  };

  // Convert 24-hour "HH:MM" into 12-hour format for display
  const formatTime = (time) => {
    if (!time || typeof time !== "string") return "Not available";

    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return "Not available";

    const date = new Date();
    date.setHours(h, m, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Validate the booking form. Returns { start, end } or null.
  const validateBooking = () => {
    const { bookingDate, startTime, endTime, partySize } = formData;

    if (!bookingDate || !startTime || !endTime || Number(partySize) < 1) {
      alert("Please fill all booking details.");
      return null;
    }

    const start = new Date(`${bookingDate}T${startTime}:00`);
    const end = new Date(`${bookingDate}T${endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      alert("Please select valid start and end time.");
      return null;
    }

    if (end <= start) {
      alert("End time must be after start time. Please check AM/PM.");
      return null;
    }

    if (start <= new Date()) {
      alert("Please select a future start time.");
      return null;
    }

    const opening = restaurant?.openingClosingTime?.openingTime;
    const closing = restaurant?.openingClosingTime?.closingTime;

    if (opening && closing && (startTime < opening || endTime > closing)) {
      alert(
        `Restaurant is open from ${formatTime(opening)} to ${formatTime(
          closing,
        )}. Please choose a time within these hours.`,
      );
      return null;
    }

    return { start, end };
  };

  const checkAvailableTables = async (e) => {
    e.preventDefault();

    if (isOwner) {
      alert("Owners cannot make bookings.");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    const times = validateBooking();
    if (!times) return;

    setTableLoading(true);
    setTables([]);
    setSelectedTable("");

    try {
      const res = await API.get(`/tables/${id}/available`, {
        params: {
          bookingDate: formData.bookingDate,
          startTime: times.start.toISOString(),
          endTime: times.end.toISOString(),
          partySize: Number(formData.partySize),
        },
      });

      setTables(res.data.tables || []);

      if (!res.data.tables?.length) {
        alert("No available tables found for this time.");
      }
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to check available tables",
      );
    } finally {
      setTableLoading(false);
    }
  };

  const handleBooking = async () => {
    if (isOwner) {
      alert("Owners cannot make bookings.");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedTable) {
      alert("Please select a table.");
      return;
    }

    const times = validateBooking();
    if (!times) return;

    setBookingLoading(true);

    try {
      // Backend expects startTime / endTime as "HH:MM" with bookingDate
      const res = await API.post(`/bookings/${id}/${selectedTable}`, {
        partySize: Number(formData.partySize),
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
      });

      alert(res.data.message || "Booking created successfully!");

      navigate("/my-bookings");
    } catch (error) {
      alert(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="details-message">Loading restaurant...</p>
        <Footer />
      </>
    );
  }

  if (!restaurant) {
    return (
      <>
        <Navbar />
        <p className="details-message">Restaurant not found.</p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="restaurant-details-page">
        <div className="details-container">
          <div className="details-image">
            <img
              src={getImageUrl(
                restaurant.imageUrl,
                "https://placehold.co/1200x500?text=Restaurant",
              )}
              alt={restaurant.name}
            />
          </div>

          <div className="details-layout">
            {/* RESTAURANT INFORMATION */}

            <section className="restaurant-information">
              <span className="details-cuisine">{restaurant.cuisine}</span>

              <h1>{restaurant.name}</h1>

              <p className="details-description">{restaurant.description}</p>

              <div className="details-info-item">
                <strong>Address</strong>
                <p>{restaurant.address}</p>
              </div>

              <div className="details-info-item">
                <strong>Contact</strong>
                <p>{restaurant.phone}</p>
              </div>

              <div className="details-info-item">
                <strong>Opening Time</strong>
                <p>{formatTime(restaurant.openingClosingTime?.openingTime)}</p>
              </div>

              <div className="details-info-item">
                <strong>Closing Time</strong>
                <p>{formatTime(restaurant.openingClosingTime?.closingTime)}</p>
              </div>
            </section>

            {/* BOOKING FORM */}

            <section className="booking-card">
              {isOwner ? (
                <div className="owner-view-notice">
                  <h2>Owner View</h2>
                  <p>
                    You are logged in as a restaurant owner. Bookings can only
                    be made by customers.
                  </p>
                </div>
              ) : (
                <>
                  <h2>Book Your Table</h2>

                  <p className="booking-subtitle">
                    Select your preferred date and time.
                  </p>

                  <form onSubmit={checkAvailableTables}>
                    <div className="booking-field">
                      <label>Booking Date</label>
                      <input
                        type="date"
                        name="bookingDate"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={formData.bookingDate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="booking-field">
                      <label>Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="booking-field">
                      <label>End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="booking-field">
                      <label>Party Size</label>
                      <input
                        type="number"
                        name="partySize"
                        min="1"
                        value={formData.partySize}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="booking-field">
                      <label>Special Notes</label>
                      <textarea
                        name="notes"
                        placeholder="Any special requests..."
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </div>

                    <button
                      type="submit"
                      className="check-tables-btn"
                      disabled={tableLoading}
                    >
                      {tableLoading ? "Checking..." : "Check Available Tables"}
                    </button>
                  </form>

                  {/* AVAILABLE TABLES */}

                  {tables.length > 0 && (
                    <div className="available-tables">
                      <h3>Available Tables</h3>

                      <div className="tables-list">
                        {tables.map((table) => (
                          <button
                            type="button"
                            key={table._id}
                            className={`table-option ${
                              selectedTable === table._id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedTable(table._id)}
                          >
                            <strong>Table {table.tableNumber}</strong>

                            <span>Capacity: {table.capacity}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="confirm-booking-btn"
                        onClick={handleBooking}
                        disabled={bookingLoading || !selectedTable}
                      >
                        {bookingLoading ? "Booking..." : "Confirm Booking"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default RestaurantDetails;
