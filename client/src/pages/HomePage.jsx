import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserById } from '../utils/api'; // Adjust path as necessary
import '../styles/HomePage.css';

const HomePage = ({ searchQuery }) => {
  const [events, setEvents] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    postalCode: '',
    city: '',
    state: '',
    country: '',
    startDateTime: '',
    endDateTime: '',
  });
  const { isAuthenticated, user, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  
  const sidebarRef = useRef(null);

  // Function to handle filter input changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Function to fetch filtered events
  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/events/', { params: filters });
      setEvents(response.data);
    } catch (error) {
      setError('Error fetching events. Please try again later.');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events data when filters change
  useEffect(() => {
    fetchEvents();
  }, [filters]);

  // Fetch user favorites if authenticated
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };

          const userResponse = await getUserById(user.sub, headers);
          setUserFavorites(userResponse.data.user.favorites || []);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserFavorites();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to clear all filters
  const clearFilters = () => {
    setFilters({
      postalCode: '',
      city: '',
      state: '',
      country: '',
      startDateTime: '',
      endDateTime: '',
    });
    fetchEvents(); // Optionally fetch events after clearing filters
  };

  // Function to handle clicks outside the sidebar
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setSidebarOpen(false);
    }
  };

  // Add event listener for clicks outside the sidebar
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Upcoming Events</h2>

      {/* Filter Button */}
      <button className="filter-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
        Filters
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="sidebar-content">
          <h3>Filters</h3>
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={filters.postalCode}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={filters.city}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={filters.state}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={filters.country}
            onChange={handleFilterChange}
          />
          <input
            type="datetime-local"
            name="startDateTime"
            placeholder="Start DateTime"
            value={filters.startDateTime}
            onChange={handleFilterChange}
          />
          <input
            type="datetime-local"
            name="endDateTime"
            placeholder="End DateTime"
            value={filters.endDateTime}
            onChange={handleFilterChange}
          />
          <button onClick={fetchEvents}>Apply Filters</button>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      {/* Event Cards */}
      <div className="event-list">
        {filteredEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            isFavorite={userFavorites.includes(event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
