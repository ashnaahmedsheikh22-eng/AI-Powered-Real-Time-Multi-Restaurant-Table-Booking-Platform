
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData, role);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="foodhub-logo">
          <div className="logo-mark">
            <div className="logo-mark-inner"></div>
          </div>

          <h1>Food<span>Hub</span></h1>
          <p>Good Food. <span>Good Mood!</span></p>
        </div>

        <div className="food-hero">
          <div className="food-gallery">
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"
              alt="Delicious burger"
              className="food-burger"
            />

            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600"
              alt="Fresh pizza"
              className="food-pizza"
            />

            <img
              src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500"
              alt="French fries"
              className="food-fries"
            />
          </div>

          <h2>Delicious Food,<br />Beautiful Moments!</h2>
          <p>Discover your favorite food and book your table.</p>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="form-heading">
            <span></span>
            <h2>Create Your Account</h2>
            <span></span>
          </div>

          <p className="form-subtitle">
            Join FoodHub and enjoy delicious meals!
          </p>

          <div className="role-select">
            <button
              type="button"
              className={role === "user" ? "active" : ""}
              onClick={() => setRole("user")}
            >
              Customer
            </button>

            <button
              type="button"
              className={role === "owner" ? "active" : ""}
              onClick={() => setRole("owner")}
            >
              Restaurant Owner
            </button>
          </div>

          <div className="input-box">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "SIGN UP →"}
          </button>

          <div className="form-bottom">
            <span></span>
            <span></span>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
