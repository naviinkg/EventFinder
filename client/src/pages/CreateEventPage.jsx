import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Snackbar, Switch, FormControlLabel, CircularProgress } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { createEvent } from '../utils/api';

const CreateEventPage = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [noOfTickets, setNoOfTickets] = useState('');
  const [price, setPrice] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventUrl, setEventUrl] = useState('');
  const [eventLocale, setEventLocale] = useState('');
  const [eventImages, setEventImages] = useState('');
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [timezone, setTimezone] = useState('');
  const [statusCode, setStatusCode] = useState('');
  const [category, setCategory] = useState('');
  const [venueId, setVenueId] = useState('');
  const [venueDetails, setVenueDetails] = useState({
    id: '',
    name: '',
    postalCode: '',
    timezone: '',
    city: '',
    state: '',
    country: '',
    address: ''
  });
  const [useVenueId, setUseVenueId] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          scope: 'openid profile email',
        },
      });

      const response = await fetch(`http://localhost:5000/users/${user.sub}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data.user);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user data:', err);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    return `${dateTimeString}:00.000Z`; // Append seconds and milliseconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!userData) {
      setError('User data not loaded');
      setLoading(false);
      return;
    }

    const eventPayload = {
      venue: useVenueId
        ? { id: venueId }
        : {
            id: venueDetails.id,
            name: venueDetails.name || null,
            postalCode: venueDetails.postalCode || null,
            timezone: venueDetails.timezone || null,
            city: venueDetails.city || null,
            state: venueDetails.state || null,
            country: venueDetails.country || null,
            address: venueDetails.address || null
          },
      event: {
        userId: user.sub,
        id: `event-${Date.now()}`, // Generate a unique ID
        name: eventName || null,
        type: eventType || null,
        url: eventUrl || null,
        locale: eventLocale || null,
        images: eventImages || null,
        sales: {
          public: {
            startDateTime: new Date(formatDateTime(salesStartDate)), // Convert input to ISO-8601
            endDateTime: new Date(formatDateTime(salesEndDate)),
          },
        },
        dates: {
          timezone: timezone || null,
          status: {
            code: statusCode || null
          },
          start: {
            localTime: localTime || null,
            localDate: eventDate ? new Date(eventDate) : null,
          }
        },
        classification: {
          segment: {
            name: {
              category: category || ''
            }
          }
        },
        no_of_tickets: parseInt(noOfTickets, 10) || null,
        price: parseFloat(price) || null,
        classifications: [' '] // Add any other fields or data as needed
      }
    };
    
    try {
      console.log(eventPayload);
      const response = await createEvent(eventPayload);
    
      if (response.status == 200) {
        setSuccess(true);
        navigate('/'); // Redirect to home or events page after successful creation
      } else if (response.status === 500 && useVenueId) {
        setAlertOpen(true); // Open popup for venue ID error
      } else {
        setError('Failed to create event');
      }
    } catch (err) {
      setError('An error occurred while creating the event');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Create Event
      </Typography>
      {success && <Typography variant="body1" color="success.main">Event created successfully!</Typography>}
      {error && <Typography variant="body1" color="error.main">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <FormControlLabel
          control={<Switch checked={useVenueId} onChange={() => setUseVenueId(!useVenueId)} />}
          label="Use Venue ID"
        />
        {!useVenueId && (
          <div>
            <TextField
              label="Venue Name"
              value={venueDetails.name}
              onChange={(e) => setVenueDetails({ ...venueDetails, name: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Postal Code"
              value={venueDetails.postalCode}
              onChange={(e) => setVenueDetails({ ...venueDetails, postalCode: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="City"
              value={venueDetails.city}
              onChange={(e) => setVenueDetails({ ...venueDetails, city: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="State"
              value={venueDetails.state}
              onChange={(e) => setVenueDetails({ ...venueDetails, state: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Country"
              value={venueDetails.country}
              onChange={(e) => setVenueDetails({ ...venueDetails, country: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="address"
              value={venueDetails.address}
              onChange={(e) => setVenueDetails({ ...venueDetails, address: e.target.value })}
              fullWidth
              margin="normal"
            />
          </div>
        )}
        {useVenueId && (
          <TextField
            label="Venue ID"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        )}
        <TextField
          label="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Event Type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Event URL"
          value={eventUrl}
          onChange={(e) => setEventUrl(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Event Locale"
          value={eventLocale}
          onChange={(e) => setEventLocale(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Event Images (comma-separated URLs)"
          value={eventImages}
          onChange={(e) => setEventImages(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sales Start Date"
              type="date"
              value={salesStartDate}
              onChange={(e) => setSalesStartDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sales End Date"
              type="date"
              value={salesEndDate}
              onChange={(e) => setSalesEndDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Event Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Local Time"
              type="time"
              value={localTime}
              onChange={(e) => setLocalTime(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <TextField
          label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Status Code"
          value={statusCode}
          onChange={(e) => setStatusCode(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Number of Tickets"
          type="number"
          value={noOfTickets}
          onChange={(e) => setNoOfTickets(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ min: 0, max: 100000 }}
        />
        <TextField
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ min: 0}}
        />
        <TextField
          label="Description"
          multiline
          rows={4}
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Create Event'}
        </Button>
      </form>
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
        <MuiAlert elevation={6} variant="filled" severity="error">
          The Venue ID is incorrect. Please check and try again.
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default CreateEventPage;
