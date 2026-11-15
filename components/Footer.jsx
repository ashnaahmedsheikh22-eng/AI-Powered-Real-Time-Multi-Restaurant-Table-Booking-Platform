import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>Food<span>Hub</span>.</h2>
          <p>
            Discover amazing restaurants and book your
            perfect dining experience.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explore</h3>
          <Link to="/">Discover</Link>
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/my-bookings">My Bookings</Link>
        </div>

        <div className="footer-links">
          <h3>Account</h3>
          <Link to="/login">Sign In</Link>
          <Link to="/signup">Create Account</Link>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 FoodHub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;