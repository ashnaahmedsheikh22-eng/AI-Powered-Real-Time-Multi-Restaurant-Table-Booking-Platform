
import { useEffect, useState } from "react";
import API from "../api/axios";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RestaurantCard from "../../components/RestaurantCard";

import "./Restaurants.css";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await API.get("/restaurants");
      setRestaurants(res.data.restaurants || []);
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message ||
        "Unable to load restaurants."
      );
    } finally {
      setLoading(false);
    }
  };

  const cuisines = [
    "All",
    ...new Set(
      restaurants
        .map((restaurant) => restaurant.cuisine)
        .filter(Boolean)
    ),
  ];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      restaurant.name?.toLowerCase().includes(searchText) ||
      restaurant.cuisine?.toLowerCase().includes(searchText) ||
      restaurant.address?.toLowerCase().includes(searchText);

    const matchesCuisine =
      cuisine === "All" || restaurant.cuisine === cuisine;

    return matchesSearch && matchesCuisine;
  });

  return (
    <>
      <Navbar />

      <main className="restaurants-page">
        <section className="restaurants-hero">
          <span>EXPLORE FOODHUB</span>
          <h1>Discover Restaurants</h1>
          <p>
            Explore amazing restaurants and find your next
            favorite dining experience.
          </p>
        </section>

        <section className="restaurants-container">
          <div className="restaurants-heading">
            <div>
              <h2>All Restaurants</h2>
              <p>
                {restaurants.length} restaurants available
              </p>
            </div>
          </div>

          <div className="restaurant-filters">
            <div className="restaurant-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search by name, cuisine or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            >
              {cuisines.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Cuisines" : item}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="restaurants-message">
              Loading restaurants...
            </p>
          ) : error ? (
            <p className="restaurants-message error">
              {error}
            </p>
          ) : filteredRestaurants.length > 0 ? (
            <>
              <p className="results-count">
                Showing {filteredRestaurants.length} restaurants
              </p>

              <div className="restaurants-grid">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="no-restaurants">
              <h3>No Restaurants Found</h3>
              <p>
                Try another restaurant name or cuisine.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setCuisine("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Restaurants;