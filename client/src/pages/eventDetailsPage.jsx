import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { addToFavorites } from '../utils/api';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import '../styles/EventDetailsPage.css';

const EventDetailsPage = () => {
  const { user } = useAuth0();
  const { eventID } = useParams();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [event, setEvent] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/events/${eventID}`);
        setEvent(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventID]);

  if (!event) {
    return <p>Loading...</p>;
  }

  const { name, localDate, localTime, venue, url, classifications, images, description, salesStart, salesEnd } = event;

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
    } else {
      await addToFavorites(eventID, user.sub);
      console.log("Favorite added");
    }
  };

  const handleBuyTicketsClick = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
    } else {
      navigate(`/events/${eventID}/payment`);
    }
  };

  const renderTooltip = (message) => (
    <Tooltip id="button-tooltip">
      {message}
    </Tooltip>
  );

  return (
    <div className="event-details-container">
      {name && <h1 className="event-title">{name}</h1>}
      
      {console.log("images is eventDetailsPage ", images)}

      {images && images.length > 0 && (
        <div className="event-images">
          {images.map((image, index) => (
            <img key={index} src={image.url} alt={`Event Image ${index}`} className="event-image" />
          ))}
        </div>
      )}

      <div className="event-info">
        {localDate && <p><strong>Date:</strong> {new Date(localDate).toLocaleDateString()}</p>}
        {localTime && <p><strong>Time:</strong> {localTime}</p>}
        {classifications && classifications.length > 0 && (
          <>
            <p><strong>Category:</strong> {classifications[0]?.segment?.name} - {classifications[0]?.genre?.name}</p>
            <p><strong>Sub-Category:</strong> {classifications[0]?.subGenre?.name}</p>
          </>
        )}
      </div>

      {description && (
        <div className="event-description">
          <h2>Description</h2>
          <p>{description}</p>
        </div>
      )}

      {(salesStart || salesEnd) && (
        <div className="sales-info">
          {salesStart && <p><strong>Sales Start:</strong> {new Date(salesStart).toLocaleString()}</p>}
          {salesEnd && <p><strong>Sales End:</strong> {new Date(salesEnd).toLocaleString()}</p>}
        </div>
      )}

      {venue && (
        <>
          <h2>Venue Information</h2>
          <div className="venue-info">
            {venue.name && <p><strong>Name:</strong> {venue.name}</p>}
            {venue.address && <p><strong>Address:</strong> {venue.address}, {venue.city}, {venue.state} {venue.postalCode}</p>}
            {venue.country && <p><strong>Country:</strong> {venue.country}</p>}
          </div>
        </>
      )}

      <div className="event-actions">
        <OverlayTrigger
          placement="top"
          overlay={renderTooltip(isAuthenticated ? 'Add to Favorites' : 'Please log in to add to favorites')}
        >
          <span className="d-inline-block">
            <button
              className="btn btn-primary"
              onClick={handleFavoriteClick}
              disabled={!isAuthenticated}
              style={!isAuthenticated ? { pointerEvents: 'none' } : {}}
            >
              Add to Favorites
            </button>
          </span>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={renderTooltip(isAuthenticated ? 'Buy Tickets' : 'Please log in to buy tickets')}
        >
          <span className="d-inline-block">
            <button
              className="btn btn-success"
              onClick={handleBuyTicketsClick}
              disabled={!isAuthenticated}
              style={!isAuthenticated ? { pointerEvents: 'none' } : {}}
            >
              Buy Tickets
            </button>
          </span>
        </OverlayTrigger>
      </div>

      {url && (
        <div className="event-link">
          <a href={url} target="_blank" rel="noopener noreferrer">View on Ticketmaster</a>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
