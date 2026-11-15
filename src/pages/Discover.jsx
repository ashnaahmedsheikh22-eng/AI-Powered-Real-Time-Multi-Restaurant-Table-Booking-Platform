
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RestaurantCard from "../../components/RestaurantCard";
import "./Discover.css";

const Discover = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] = useState({
    cuisine: "",
    location: "",
    partySize: "",
    preference: "",
  });

  const [aiRestaurants, setAiRestaurants] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSearched, setAiSearched] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await API.get("/restaurants");

      setRestaurants(
        Array.isArray(res.data)
          ? res.data
          : res.data.restaurants || []
      );
    } catch (error) {
      console.log("Restaurant error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchText = search.toLowerCase();

    return (
      restaurant.name?.toLowerCase().includes(searchText) ||
      restaurant.cuisine?.toLowerCase().includes(searchText) ||
      restaurant.address?.toLowerCase().includes(searchText)
    );
  });

  const handlePreferenceChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value,
    });
  };

  const getRecommendations = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiRestaurants([]);
    setAiSearched(true);

    try {
      const res = await API.post("/ai/recommend", {
        cuisine: preferences.cuisine,
        location: preferences.location,
        partySize: preferences.partySize
          ? Number(preferences.partySize)
          : "",
        preference: preferences.preference,
      });

      const result = res.data.restaurants;

      if (!Array.isArray(result)) {
        throw new Error(
          "Backend se restaurant cards ka data nahi mila. Backend controller update karna hoga."
        );
      }

      setAiRestaurants(result);
    } catch (error) {
      setAiError(
        error.response?.data?.message ||
        error.message ||
        "Unable to get recommendations"
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="discover-page">

        <section className="hero-section">
          <div className="hero-overlay">
            <div className="hero-content">
              <span className="hero-label">
                DISCOVER YOUR NEXT DINING EXPERIENCE
              </span>

              <h1>
                Find Your Perfect
                <span> Dining Spot</span>
              </h1>

              <p>
                Explore amazing restaurants, discover new cuisines
                and reserve your perfect table with FoodHub.
              </p>

              <div className="hero-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search restaurant, cuisine or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <button
                  onClick={() =>
                    document
                      .getElementById("popular-restaurants")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          className="popular-section"
          id="popular-restaurants"
        >
          <div className="section-heading">
            <div>
              <span className="section-label">EXPLORE FOODHUB</span>
              <h2>Popular Restaurants</h2>
              <p>
                Discover restaurants and explore different cuisines.
              </p>
            </div>

            <button
              className="view-all-btn"
              onClick={() => navigate("/restaurants")}
            >
              View All Restaurants →
            </button>
          </div>

          {loading ? (
            <p className="discover-message">
              Loading restaurants...
            </p>
          ) : filteredRestaurants.length > 0 ? (
            <div className="restaurant-grid">
              {filteredRestaurants.slice(0, 6).map((restaurant) => (
                <RestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                />
              ))}
            </div>
          ) : (
            <p className="discover-message">
              No restaurants found.
            </p>
          )}
        </section>

        {/* AI RECOMMENDATIONS */}
        <section className="ai-section">
          <div className="ai-intro">
            <span className="section-label">
              SMART DINING ASSISTANT
            </span>

            <h2>Let AI Find Your Perfect Restaurant</h2>

            <p>
              Tell us what you are looking for and get restaurant
              recommendations based on your preferences.
            </p>
          </div>

          <form className="ai-form" onSubmit={getRecommendations}>
            <div className="ai-input-group">
              <label>Cuisine</label>
              <input
                type="text"
                name="cuisine"
                placeholder="e.g. Pakistani, Italian"
                value={preferences.cuisine}
                onChange={handlePreferenceChange}
              />
            </div>

            <div className="ai-input-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Enter location"
                value={preferences.location}
                onChange={handlePreferenceChange}
              />
            </div>

            <div className="ai-input-group">
              <label>Party Size</label>
              <input
                type="number"
                name="partySize"
                min="1"
                placeholder="Number of people"
                value={preferences.partySize}
                onChange={handlePreferenceChange}
              />
            </div>

            <div className="ai-input-group">
              <label>Your Preference</label>
              <input
                type="text"
                name="preference"
                placeholder="e.g. Family friendly"
                value={preferences.preference}
                onChange={handlePreferenceChange}
              />
            </div>

            <button
              type="submit"
              className="ai-submit-btn"
              disabled={aiLoading}
            >
              {aiLoading
                ? "Finding Restaurants..."
                : "Get AI Recommendations"}
            </button>

            {aiLoading && (
              <p className="ai-loading-note">
                Finding the best restaurants for you...
              </p>
            )}
          </form>

          {aiError && (
            <p className="ai-error-message">{aiError}</p>
          )}

          {aiSearched && !aiLoading && aiRestaurants.length === 0 && !aiError && (
            <p className="ai-empty-message">
              No matching restaurants found. Try different preferences.
            </p>
          )}

          {aiRestaurants.length > 0 && (
            <div className="ai-result">
              <div className="ai-result-heading">
                <span className="section-label">
                  PERSONALIZED FOR YOU
                </span>
                <h3>Your AI Recommended Restaurants</h3>
              </div>

              <div className="ai-restaurant-grid">
                {aiRestaurants.map((restaurant) => (
                  <div
                    className="ai-restaurant-card"
                    key={restaurant._id}
                  >
                    <RestaurantCard restaurant={restaurant} />

                    <div className="ai-reason">
                      <strong>Why AI recommends it</strong>
                      <p>
                        {restaurant.aiReason ||
                          "This restaurant matches your preferences."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Discover;
