import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../../components/Navbar";
import getImageUrl from "../../components/getImageUrl";
import Footer from "../../components/Footer";
import "./MyRestaurants.css";

const MyRestaurants = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      const res = await API.get("/restaurants/my-restaurants");
      setRestaurants(res.data.restaurants || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const deleteRestaurant = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this restaurant?",
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/restaurants/${id}`);
      alert("Restaurant deleted successfully");
      fetchRestaurants();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  // Convert 24-hour time into 12-hour format
  const formatTime = (time) => {
    if (!time || typeof time !== "string") return "Not available";

    const [hours, minutes] = time.split(":");

    if (hours === undefined || minutes === undefined) {
      return "Not available";
    }

    const hour = Number(hours);
    const minute = Number(minutes);

    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return "Not available";
    }

    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <Navbar />

      <div className="my-restaurants">
        <div className="restaurants-heading">
          <div>
            <h1>My Restaurants</h1>
            <p>Manage all your restaurants in one place.</p>
          </div>

          <button onClick={() => navigate("/owner/add-restaurant")}>
            + Add Restaurant
          </button>
        </div>

        {loading ? (
          <p className="restaurant-message">Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <div className="empty-restaurants">
            <h2>No Restaurants Yet</h2>
            <p>Add your first restaurant to get started.</p>
          </div>
        ) : (
          <div className="owner-restaurant-grid">
            {restaurants.map((restaurant) => (
              <div className="owner-restaurant-card" key={restaurant._id}>
                <img
                  src={getImageUrl(restaurant.imageUrl)}
                  alt={restaurant.name}
                />

                <div className="owner-restaurant-info">
                  <span className={`restaurant-status ${restaurant.status}`}>
                    {restaurant.status}
                  </span>

                  <h2>{restaurant.name}</h2>
                  <p>{restaurant.cuisine}</p>
                  <p>{restaurant.address}</p>

                  <p>
                    <strong>Opening:</strong>{" "}
                    {formatTime(restaurant.openingClosingTime?.openingTime)}
                  </p>

                  <p>
                    <strong>Closing:</strong>{" "}
                    {formatTime(restaurant.openingClosingTime?.closingTime)}
                  </p>

                  <div className="owner-restaurant-actions">
                    <button
                      onClick={() =>
                        navigate(`/owner/edit-restaurant/${restaurant._id}`)
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/owner/restaurants/${restaurant._id}/tables`)
                      }
                    >
                      Manage Tables
                    </button>

                    <button
                      className="delete-restaurant-btn"
                      onClick={() => deleteRestaurant(restaurant._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default MyRestaurants;
