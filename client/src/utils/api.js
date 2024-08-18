// src/api/api.js

import axios from 'axios';
import TokenUtil from '../utils/TokenUtil'; // Ensure you have a utility for token management

const API_URL = 'http://localhost:5000'; // Backend API base URL

// Utility function to get the token
const getToken = async () => {
  try {
    const token = await TokenUtil.getToken(); // Retrieve the token from your utility

    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
};

// Events
export const getEvents = async () => {
  try {
    const token = await getToken();
    return axios.get(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getEventById = async (id) => {
  try {
    const token = await getToken();
    return axios.get(`${API_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
};

export const getEventByUserId = async (id) => {
  try {
    const token = await getToken();
    return axios.post(`${API_URL}/users/getEventsPosted`, {
      userId : id,
    },{
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
};


// Users
export const getUsers = async () => {
  try {
    const token = await getToken();
    return axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const token = await getToken();
    return axios.get(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const getVenueById = async (id) => {
  try {
    const token = await getToken();
    return axios.get(`${API_URL}/events/venue/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const updateUserOrganization = async (id, organization, firstName, lastName, email, password) => {
  try {
    const token = await getToken();
    return axios.post(`${API_URL}/users/signup`, {
        auth0_id : id,
        email : email,
        name : firstName + lastName,
        password: password,
        organization : organization,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error updating user organization:', error);
    throw error;
  }
};

// Additional API Methods
export const createEvent = async (eventData) => {
  try {
    const token = await getToken();
    console.log(token);
    return await axios.post(`${API_URL}/events`, eventData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const token = await getToken();
    return axios.delete(`${API_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Purchase Tickets
export const purchaseTickets = async (id, eventId, noOfTickets) => {
  const token = await getToken(); // Retrieve token from TokenUtil
  console.log("here at purchase" + id);
  console.log("here event " + eventId);
  return axios.post(
    `${API_URL}/users/buyTickets`,
    {
      "userId" : id,
      "eventId" : eventId,
      "noOfTickets": noOfTickets
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

// Add to Favorites
export const addToFavorites = async (eventId, userId) => {
  try {
    const token = await getToken();
    return axios.post(`${API_URL}/users/addToFavourites`, {
      eventId,
      userId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Add to Favorites
export const sendEmail = async (paymentDetails) => {
  try {
    const token = await getToken();
    return axios.post(`${API_URL}/users/sendConfirmationEmail`, {
      paymentDetails
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const updateEventStatus = async (userId, eventId, newStatus, userEventId) => {
  try {
    const token = await getToken();
    const response = await axios.post(`${API_URL}/users/updateUserEventStatus`, {
      userId,
      eventId,
      newStatus,
      userEventId
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error updating event status:', error);
    throw error;
  }
};

// Function to remove an event from a user's favorites
export const removeFromFavorites = async (userId, eventId) => {
  try {
    const token = await getToken();
    return axios.post(`${API_URL}/users/removeFromFavourites`, {
      userId,
      eventId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error removing event from favorites:', error);
    throw error;
  }
};


export const getUserHistory = async (userId) => {
  try {
    const token = await getToken();
    // The body data is passed as the second argument, headers as the third
    return await axios.post(
      `${API_URL}/users/getUserHistory`,{
      headers: { Authorization: `Bearer ${token}` },
      data: { userId }
      } 
    );
  } catch (error) {
    console.error('Error fetching user history:', error);
    throw error;
  }
};