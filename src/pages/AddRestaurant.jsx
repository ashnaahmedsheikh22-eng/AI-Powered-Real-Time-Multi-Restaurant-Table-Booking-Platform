
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./AddRestaurant.css";

const AddRestaurant = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "",
    address: "",
    phone: "",
    openingTime: "",
    closingTime: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select a restaurant image");
      return;
    }

    if (!formData.openingTime || !formData.closingTime) {
      alert("Please select opening and closing time");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("cuisine", formData.cuisine);
      data.append("address", formData.address);
      data.append("phone", formData.phone);

      data.append(
        "openingClosingTime",
        JSON.stringify({
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
        })
      );

      data.append("image", image);

      await API.post("/restaurants", data);

      alert("Restaurant added successfully!");

      navigate("/owner/restaurants");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to add restaurant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="add-restaurant-page">
        <form
          className="add-restaurant-form"
          onSubmit={handleSubmit}
        >
          <h1>Add Restaurant</h1>
          <p>Enter your restaurant information below.</p>

          <label>Restaurant Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter restaurant name"
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your restaurant"
            required
          />

          <label>Cuisine</label>
          <input
            type="text"
            name="cuisine"
            value={formData.cuisine}
            onChange={handleChange}
            placeholder="Pakistani, Italian, Chinese"
            required
          />

          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter restaurant address"
            required
          />

          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
          />

          <div className="restaurant-time-fields">
            <div>
              <label>Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label>Restaurant Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Restaurant"}
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default AddRestaurant;
