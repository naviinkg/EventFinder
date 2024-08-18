import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import { FaHeart } from 'react-icons/fa'; // Use react-icons for heart icon
import { useAuth0 } from '@auth0/auth0-react';
import { addToFavorites, removeFromFavorites } from '../utils/api'; // Import the global API functions

import '../styles/EventCard.css';

const EventCard = ({ event = {}, isFavorite: initialFavorite, showFavoriteIcon = true}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();

  const {
    name = 'Unknown Event',
    localDate,
    localTime,
    images = [], 
    id,
  } = event;


  const handleFavoriteClick = async (e) => {
    console.log("here in handleFavoriteClick");
    e.stopPropagation();
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    try {
      setIsFavorite(!isFavorite);

      if (!isFavorite) {
        await addToFavorites(id, user.sub); 
      } 
      else {
        await removeFromFavorites(user.sub, id);
      }

      console.log('Favorite status updated');
    } 
    catch (error) {
      console.error('Error updating favorite status:', error);
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <div className="event-card">
      <Link to={`/events/${id}`} className="event-banner">
        <img
          src={images[0]?.url || 'https://via.placeholder.com/300'} // Fallback image URL
          alt={name}
          className="event-image"
        />
        <div className="event-info">
          <h3>{name}</h3>
          <p>Date: {new Date(localDate).toLocaleDateString()}</p>
          <p>Time: {localTime}</p>
        </div>
      </Link>
      {showFavoriteIcon && (<button 
        className="btn btn-outline-danger favorite-button"
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <FaHeart color={isFavorite ? '#dc3545' : '#6c757d'} />
      </button>)}
    </div>
  );
};

export default EventCard;
