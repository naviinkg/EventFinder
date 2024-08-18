import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import moment from 'moment';
import { Button, Card } from 'react-bootstrap';
import { updateEventStatus } from '../utils/api'; // Ensure the path is correct

const BookedEventCard = ({ event = {}, userEventData = {}, venue = {} }) => {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const [status, setStatus] = useState(userEventData.status);
  
  const {
    name = 'Unknown Event',
    localDate,
    localTime,
    images = [],
    id,
  } = event;

  const {
    no_of_tickets = 0,
    total_price = 0,
  } = userEventData;

  const {
    venue_name,
    postalCode,
    city,
    state,
    country,
    address,
  } = venue;

  const fullAddress = [
    venue_name,
    address,
    city,
    state,
    postalCode,
    country,
  ].filter(Boolean).join(', ');

  useEffect(() => {
    setStatus(userEventData.status || 'Purchased');
  }, [userEventData.status]);

  const handleStatusChange = async (newStatus) => {
    const currentDate = moment().format('YYYY-MM-DD');

    if (moment(currentDate).isAfter(localDate)) {
      alert('Event is expired.');
      return;
    }

    try {
      await updateEventStatus(user.sub, id, newStatus, userEventData.id);
      setStatus(newStatus); // Update local state to reflect new status
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  return (
    <Card className="mb-3">
      <Card.Img variant="top" src={images[0]?.url || 'https://via.placeholder.com/300'} />
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>
        <strong>Date:</strong> {new Date(localDate).toLocaleDateString()}<br />
          <strong>Time:</strong> {localTime}<br />
          <strong>Status:</strong> {status}<br />
          <strong>Tickets:</strong> {no_of_tickets}<br />
          <strong>Total Price:</strong> ${total_price}<br />
          <strong>Address:</strong> {fullAddress || 'No address provided'}
        </Card.Text>
        <div className="mt-2">
          {status === 'purchased' && (
            <>
              <Button
                variant="success"
                onClick={() => handleStatusChange('going')}
                disabled={moment().isAfter(localDate)}
              >
                Mark as Going
              </Button>
              <Button
                variant="danger"
                onClick={() => handleStatusChange('not-going')}
                className="ms-2"
                disabled={moment().isAfter(localDate)}
              >
                Mark as Not Going
              </Button>
            </>
          )}
          {(status === 'going' || status === 'not-going') && (
            <>
              <Button
                variant={status === 'going' ? 'danger' : 'success'}
                onClick={() => handleStatusChange(status === 'going' ? 'not-going' : 'going')}
                disabled={moment().isAfter(localDate)}
              >
                {status === 'going' ? 'Mark as Not Going' : 'Mark as Going'}
              </Button>
            </>
          )}
          {moment().isAfter(localDate) && (
            <span className="text-danger ms-2"> (Event is expired)</span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookedEventCard;
