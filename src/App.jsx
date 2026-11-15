import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Discover from "./pages/Discover";
import ManageTables from "./pages/ManageTables";

import RestaurantDetails from "./pages/RestaurantDetails";
import MyBookings from "./pages/MyBookings";
import AddRestaurant from "./pages/AddRestaurant";
import Login from "./pages/Login";
import MyRestaurants from "./pages/MyRestaurants";
import OwnerDashboard from "./pages/OwnerDashboard";
import Restaurants from "./pages/Restaurants";
import Signup from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/owner/add-restaurant" element={<AddRestaurant />} />
        <Route path="/owner/restaurants/:restaurantId/tables" element={<ManageTables />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/owner/restaurants" element={<MyRestaurants />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/restaurants" element={<Restaurants />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
