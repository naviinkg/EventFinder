import pkg from "@prisma/client";
import bcrypt from 'bcrypt';
import { sendPurchaseConfirmationEmail } from "../util/emailUtils.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();


// Ping endpoint for server health check
export const ping = (req, res) => {
  try {

    res.status(200).json({ message: 'Server is up and running!' });
  } catch (err) {
    console.error('Failed to ping server:', err);
    res.status(500).json({ error: 'Failed to ping server.' });
  }
};


export const getAuthentication = (req, res) => {
  try {
    
    console.log('Request Headers:', req.headers);
    res.status(200).json({ message: 'Authentication is good!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to authenticate.' });
  }
};


// Sign Up
export const signUp = async (req, res) => {
  const {auth0_id, email, name, organization } = req.body;
  
  try {
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        auth0_id,
        email,
        name,
        organization,
      },
    });
    
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to sign up user.' });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    
    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log in user.' });
  }
};

// View User Details
export const viewUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { auth0_id: id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
};

// Update User Details
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, password, organization } = req.body;
  
  try {
    const updateData = {};
    
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (organization) updateData.organization = organization;

    const updatedUser = await prisma.user.update({
      where: { auth0_id: id },
      data: updateData,
    });
    
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

// Delete User Account
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.user.delete({
      where: { auth0_id: id },
    });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};

/**
 * Add an event to the user's favorites.
 * @param {number} userId - The ID of the user.
 * @param {string|number} eventId - The ID of the event to add to favorites.
 * @returns {Promise<void>}
 */

export const addEventToFavorites = async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    let favorites;
    // Validate inputs
    if (typeof userId !== 'string' || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Fetch the user to get current favorites
    const user = await prisma.user.findUnique({
      where: { auth0_id: userId }
    });

    if (!user) 
      return res.status(404).json({ error: 'User not found' });
    
    if (Array.isArray(user.favorites)) {
      favorites = user.favorites;
    } 
    else if (user.favorites) {
      try {
        favorites = JSON.parse(user.favorites);
      } catch (err) {
        return res.status(500).json({ message: 'Failed to parse favorites', error: err.message });
      }
    } 
    else {
      favorites = [];
    }
    

    // Check if the event is already in favorites
    if (favorites.includes(eventId)) {
      return res.status(200).json({ message: 'Event is already in favorites' });
    }

    favorites.push(eventId);

    await prisma.user.update({
      where: { auth0_id: userId },
      data: { favorites: favorites },
    });

    return res.status(200).json({ message: 'Event added to favorites' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add event to favorites' });
  }
};

export const removeFromFavorites = async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    // Validate inputs
    if (typeof userId !== 'string' || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Fetch the user to get current favorites
    const user = await prisma.user.findUnique({
      where: { auth0_id: userId }
    });

    if (!user) 
      return res.status(404).json({ error: 'User not found' });
    
    let favorites = [];

    if (Array.isArray(user.favorites)) {
      favorites = user.favorites;
    } else if (user.favorites) {
      try {
        favorites = JSON.parse(user.favorites);
      } catch (err) {
        return res.status(500).json({ message: 'Failed to parse favorites', error: err.message });
      }
    }

    // Check if the event is in favorites
    if (!favorites.includes(eventId)) {
      return res.status(404).json({ message: 'Event not found in favorites' });
    }

    // Remove the event from favorites
    favorites = favorites.filter(fav => fav !== eventId);

    await prisma.user.update({
      where: { auth0_id: userId },
      data: { favorites: favorites },
    });

    return res.status(200).json({ message: 'Event removed from favorites' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove event from favorites' });
  }
};

/**
 * Handle ticket purchase for an event by a user.
 * @param {Object} req - The request object containing user ID, event ID, and ticket count.
 * @param {Object} res - The response object for sending responses.
 */
export const buyTickets = async (req, res) => {
  try {
    const { userId, eventId, noOfTickets } = req.body;

    // Validate inputs
    if (typeof userId !== 'string' || typeof eventId !== 'string' || typeof noOfTickets !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Fetch event details
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if the event is on sale
    if (event.statusCode !== 'onsale') {
      return res.status(400).json({ error: 'Event is not on sale' });
    }

    // Check ticket availability if it's defined
    if (event.no_of_tickets !== null && event.no_of_tickets !== undefined) {
      if (event.no_of_tickets < noOfTickets) {
        return res.status(401).json({ error: 'Not enough tickets available' });
      }
    }

    // Begin transaction
    await prisma.$transaction(async (prisma) => {
      
      let price = 0;
      // Update event tickets if no_of_tickets is defined
      if (event.no_of_tickets !== null && event.no_of_tickets !== undefined) {
        await prisma.event.update({
          where: { id: eventId },
          data: { no_of_tickets: event.no_of_tickets - noOfTickets },
        });
        price = event.price * noOfTickets;
      }

      // Create UserEvent entry
      await prisma.userEvent.create({
        data: {
          user_id: userId,
          event_id: eventId,
          status: 'purchased',
          no_of_tickets: noOfTickets,
          total_price: price, // Assuming no price calculation for simplicity
        },
      });
    });

    return res.status(200).json({ message: 'Tickets purchased successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to buy tickets' });
  } finally {
    await prisma.$disconnect();
  }
};



/**
 * Update the status of a UserEvent entry.
 * @param {Object} req - The request object containing user ID, event ID, and new status.
 * @param {Object} res - The response object for sending responses.
 */
export const updateUserEventStatus = async (req, res) => {
  try {
    const {userId, eventId, newStatus, userEventId } = req.body;

    // Validate inputs
    if (typeof userId !== 'string' || typeof eventId !== 'string' || !['going', 'not-going'].includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Fetch the event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { statusCode: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if the event is expired
    if (event.statusCode === 'expired') {
      return res.status(400).json({ error: 'Cannot update status for an expired event' });
    }

    // Update the UserEvent status
    const userEvent = await prisma.userEvent.updateMany({
      where: {
        user_id: userId,
        event_id: eventId,
        id : userEventId
      },
      data: {
        status: newStatus,
      },
    });

    if (userEvent.count === 0) {
      return res.status(404).json({ error: 'UserEvent not found or status already updated' });
    }

    return res.status(200).json({ message: 'UserEvent status updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update UserEvent status' });
  } finally {
    await prisma.$disconnect();
  }
};

export const getUserHistory = async (req, res) => {
  const {userId} = req.body;
  try {
    // Fetch all UserEvent records associated with the user
    const userEvents = await prisma.userEvent.findMany({
      where: { user_id: userId },
      include: {
        event: true // Include event details in the result
      }
    });
    
    res.json(userEvents);
   
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user history.' });
  }
};

// Get events posted by a user
export const getEventsPosted = async (req, res) => {
  const {userId} = req.body;

  try {
    // Fetch the user's eventsPosted JSON field
    const user = await prisma.user.findUnique({
      where: { auth0_id: userId },
      select: { eventsPostedId: true } // Fetch only the eventsPosted field
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Parse eventsPosted JSON field
    const eventsPostedIds = user.eventsPostedId ? JSON.parse(user.eventsPostedId) : [];

    // If no events are posted, return an empty array
    if (eventsPostedIds.length === 0) {
      return res.json([]);
    }

    // Fetch details of the events
    const events = await prisma.event.findMany({
      where: {
        id: {
          in: eventsPostedIds
        }
      }
    });

    // Return the events details as a response
    res.json(events);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};



export const sendConfirmationEmail = async (req, res) => {
  
  console.log("here in constroller");
  const {paymentDetails} = req.body;

  console.log("the request body = ", paymentDetails);

  try {
    // await sendPurchaseConfirmationEmail(paymentDetails);
    res.status(200).json({message: 'Email sent successful'});
  }
  catch(error){
    res.status(500).json({error: error});
  }

};
