import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isOwner = user?.role === "owner";
  const isCustomer = user?.role === "user";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        Food<span>Hub</span>.
      </Link>

      <div className="nav-links">
        {/* OWNER: Dashboard + Discover */}
        {isOwner && (
          <>
            <Link to="/owner-dashboard">Dashboard</Link>
            <Link to="/">Discover</Link>
          </>
        )}

        {/* CUSTOMER: Discover + My Bookings */}
        {isCustomer && (
          <>
            <Link to="/">Discover</Link>
            <Link to="/my-bookings">My Bookings</Link>
          </>
        )}

        {/* GUEST (login nahi): Discover + Restaurants */}
        {!user && (
          <>
            <Link to="/">Discover</Link>
            <Link to="/restaurants">Restaurants</Link>
          </>
        )}
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name}</span>

            <button className="nav-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-login">
              Sign In
            </Link>

            <Link to="/signup" className="nav-btn">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;