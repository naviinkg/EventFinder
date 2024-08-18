import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getUserById, getEventById, getVenueById, updateEventStatus, getUserHistory, getEventByUserId } from '../utils/api'; // Ensure correct path
import TokenUtil from '../utils/TokenUtil';
import BookedEventCard from '../components/BookedEventCard';
import EventCard from '../components/EventCard';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';

const ProfilePage = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [eventDetails, setEventDetails] = useState({});
  const [venueDetails, setVenueDetails] = useState({});
  const [bookedEvents, setBookedEvents] = useState([]);
  const [postedEvents, setPostedEvents] = useState([]); // State for posted events
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData(user.sub);
    }
  }, [isAuthenticated, user]);

  const fetchUserData = async (auth0Id) => {
    try {

      // Fetch user data
      const userResponse = await getUserById(auth0Id);
      const userData = userResponse.data.user;
      setUserData(userData);

      // Fetch user history (booked events)
      const historyResponse = await getUserHistory(auth0Id);
      const fetchedBookedEvents = historyResponse.data || [];
      setBookedEvents(fetchedBookedEvents);

      // Fetch posted events
      const postedEventsResponse = await getEventByUserId(auth0Id);
      const fetchedPostedEvents = postedEventsResponse.data || [];
      setPostedEvents(fetchedPostedEvents);

      // Fetch event details
      const eventIds = [...new Set([
        ...(userData.favorites || []),
        ...(fetchedBookedEvents.map(event => event.event_id) || []),
        ...(fetchedPostedEvents.map(event => event.id) || [])
      ])];

      if (eventIds.length > 0) {
        const eventDetailsPromises = eventIds.map(eventId => getEventById(eventId));
        const eventDetailsResponses = await Promise.all(eventDetailsPromises);
        const eventDetailsMap = {};
        eventDetailsResponses.forEach(res => {
          eventDetailsMap[res.data.id] = res.data;
        });
        setEventDetails(eventDetailsMap);

        // Fetch venue details for each event
        const venueIds = [...new Set(
          eventDetailsResponses.flatMap(res => res.data.venueId ? [res.data.venueId] : [])
        )];

        if (venueIds.length > 0) {
          const venueDetailsPromises = venueIds.map(venueId => getVenueById(venueId));
          const venueDetailsResponses = await Promise.all(venueDetailsPromises);
          const venueDetailsMap = {};
          venueDetailsResponses.forEach(res => {
            venueDetailsMap[res.data.id] = res.data;
          });
          setVenueDetails(venueDetailsMap);
        }
      }
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  if (loading) return <Spinner animation="border" variant="primary" />; // Bootstrap spinner for loading
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <h2 className="my-4">Profile Page</h2>
      {userData ? (
        <div>
          <Row className="mb-4">
            <Col md={4}>
              <div className="profile-info">
                <h4>Profile Information</h4>
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Organization:</strong> {userData.organization}</p>
              </div>
            </Col>
            <Col md={8} className="d-flex align-items-center">
              <Button variant="primary" onClick={handleCreateEvent}>Create Event</Button>
            </Col>
          </Row>

          <h3>Favorites</h3>
          <Row>
            {userData.favorites && userData.favorites.length > 0 ? (
              userData.favorites.map((eventId) => (
                <Col md={4} key={eventId} className="mb-3">
                  <EventCard
                    event={eventDetails[eventId] || {}}
                    isFavorite={true}
                  />
                </Col>
              ))
            ) : (
              <p>No favorite events found.</p>
            )}
          </Row>

          <h3>Posted Events</h3> {/* Add Posted Events Section */}
          <Row>
            {postedEvents.length > 0 ? (
              postedEvents.map((event) => (
                <Col md={4} key={event.id} className="mb-3">
                  <EventCard
                    event={eventDetails[event.id] || {}}
                    showFavoriteIcon={false}
                  />
                </Col>
              ))
            ) : (
              <p>No posted events found.</p>
            )}
          </Row>

          <h3>Booked Events</h3>
          <Row>
            {bookedEvents.length > 0 ? (
              bookedEvents.map((userEvent, index) => (
                <Col md={4} key={`${userEvent.event_id}_${index}`} className="mb-3">
                  <BookedEventCard
                    event={eventDetails[userEvent.event_id] || {}}
                    userEventData={userEvent}
                    venue={venueDetails[eventDetails[userEvent.event_id]?.venueId] || {}}
                  />
                </Col>
              ))
            ) : (
              <p>No booked events found.</p>
            )}
          </Row>
        </div>
      ) : (
        <div>No user data available.</div>
      )}
    </Container>
  );
};

export default ProfilePage;
