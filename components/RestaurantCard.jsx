import { Link } from "react-router-dom";
import getImageUrl from "./getImageUrl";
import "./RestaurantCard.css";

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      <div className="restaurant-image">
        <img
          src={getImageUrl(restaurant.imageUrl)}
          alt={restaurant.name}
        />

        <span className="restaurant-tag">
          {restaurant.cuisine}
        </span>
      </div>

      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>

        <p className="restaurant-address">
          {restaurant.address}
        </p>

        <p className="restaurant-description">
          {restaurant.description}
        </p>

        <Link
          to={`/restaurant/${restaurant._id}`}
          className="restaurant-view-btn"
        >
          View Restaurant
        </Link>
      </div>
    </div>
  );
};

export default RestaurantCard;