import { syncEventsAndVenues } from '../util/syncAPI.js';
import { updateExpiredEvents } from '../util/eventUtils.js';
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    // Extract filters from the query parameters
    const filters = { ...req.query };

    await syncEventsAndVenues(filters);
    console.log("events updated = ",await updateExpiredEvents());

    // Build Prisma query filter based on the request filters
    const venueFilters = {};
    const eventFilters = {};

    if (filters.postalCode) {
      venueFilters.postalCode = filters.postalCode;
    }

    if (filters.timezone) {
      venueFilters.timezone = filters.timezone;
    }

    if (filters.city) {
      venueFilters.city = filters.city;
    }

    if (filters.state) {
      venueFilters.state = filters.state;
    }

    if (filters.country) {
      venueFilters.country = filters.country;
    }

    // Handle date range filters
    if (filters.startDateTime && filters.endDateTime) {
      eventFilters.localDate = {
        gte: new Date(filters.startDateTime),
        lte: new Date(filters.endDateTime)
      };
    }
    else if(filters.startDateTime) {
      eventFilters.localDate = new Date(filters.startDateTime);
    }

    // Fetch filtered venues from the database
    const filteredVenues = await prisma.venue.findMany({
      where: venueFilters
    });

    // Extract IDs of the filtered venues
    const venueIds = filteredVenues.map(venue => venue.id);

    // Build query condition for events
    const eventWhereCondition = {
      venueId: {
        in: venueIds
      },
      ...eventFilters // Add event date range filter if it exists
    };

    // Fetch events associated with the filtered venues and date range filter
    const events = await prisma.event.findMany({
      where: eventWhereCondition
    });

    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  console.log("here in ID =", req.params.id);
  try {
    // Fetch the event details
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });

    if (event) {
      let venue = null;

      // Fetch the venue details if venueId is present
      if (event.venueId) {
        venue = await prisma.venue.findUnique({
          where: { id: event.venueId }
        });
      }

      // Combine event and venue details
      const response = {
        ...event,
        venue: venue || { location: 'No venue Found' }
      };

      res.json(response);
    } else {
      res.status(404).json({ error: 'Event not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
};


export const getVenueById = async(req, res) => {
  try {
    const event = await prisma.venue.findUnique({
      where: { id: req.params.id }
    });
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: 'Venue not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch venue.' });
  }
};

// Create a new event
export const createEvent = async (req, res) => {
  const { event, venue } = req.body;

  console.log("event = {}", event);
  console.log("venue = {}", venue);

  const venueCount = await prisma.venue.count();
  let customVenueId =  `Venue${venueCount + 1}`;



  const localDate = event.dates?.start?.localDate
        ? event.dates.start.localDate
        : new Date().toISOString();

  console.log("new localDate = {}", localDate);
  console.log("old localDate = {}", event.dates.start.localDate);

  if (Object.keys(venue).length > 1 ) {
    console.log("here trying to create");
    try {
      await prisma.venue.create({
        data: {
          id: customVenueId,
          name: venue.name || null,
          postalCode: venue.postalCode || null,
          city: venue.name || null,
          state: venue.state || null,
          country: venue.country || null,
          address: venue.address || null
        },
      });
    } catch (error) {
      console.log("error in creating venue ", error);
      console.error('Venue Exists');
    }
  } else {
    customVenueId = venue.id;
  }

  try {
    const createdEvent = await prisma.event.create({
      data: {
        id: event.id,
        name: event.name || null,
        type: event.type || null,
        url: event.url || null,
        locale: event.locale || null,
        images: event.images ? event.images.split(',').map(image => image.trim()) : [],
        description: event.info || null,
        salesStart: event.sales.public.startDateTime || null,
        salesEnd: event.sales.public.endDateTime || null,
        localDate: localDate ? new Date(localDate) : null,
        localTime: event.dates?.start?.localTime || null,
        timezone: event.dates?.timezone || null,
        statusCode: event.dates?.status.code || null,
        category: event.classifications[0]?.segment?.name || '',
        posted_by: {
          connect: { auth0_id: event.userId } // Connect user based on userId
        },
        no_of_tickets: event.no_of_tickets,
        price: event.price,
        venue: {
          connect: { id: customVenueId } // Ensure that venueId is correctly assigned
        },
        classifications: event.classifications || null
      },
    });

    // Update the user's eventsPosted column
    // Add event ID to the user's eventsPosted JSON
    if (event.userId) {
      // Fetch the current user data
      const user = await prisma.user.findUnique({
        where: { auth0_id: event.userId },
      });

      if (user) {
        // Update the user's eventsPosted JSON
        const updatedEventsPosted = user.eventsPostedId ? JSON.parse(user.eventsPostedId) : [];
        updatedEventsPosted.push(createdEvent.id);

        await prisma.user.update({
          where: { auth0_id: event.userId },
          data: {
            eventsPostedId: JSON.stringify(updatedEventsPosted)
          }
        });
      }
    }
    res.status(200).json({ message: 'Event created', createdEvent });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Event with same ID exists' });
  }
};


export const updateEvent = async (req, res) => {
  const { event, venue } = req.body;
  const eventId = req.params.id; // Assuming you pass the event ID as a URL parameter
  let venueId;

  const localDate = event.dates?.start?.localDate
        ? `${event.dates.start.localDate}T00:00:00Z`
        : new Date().toISOString();

  try {
    if (venue) {
      venueId = venue.id;

      await prisma.venue.upsert({
        where: { id: venue.id },
        update: {
          name: venue.name || null,
          postalCode: venue.postalCode || null,
          timezone: venue.timezone || null,
          city: venue.city?.name || null,
          state: venue.state?.stateCode || null,
          country: venue.country?.countryCode || null,
          address: venue.address?.line1 || null,
          location: {
            longitude: venue.location?.longitude || null,
            latitude: venue.location?.latitude || null
          },
        },
        create: {
          id: venue.id,
          name: venue.name || null,
          postalCode: venue.postalCode || null,
          timezone: venue.timezone || null,
          city: venue.city?.name || null,
          state: venue.state?.stateCode || null,
          country: venue.country?.countryCode || null,
          address: venue.address?.line1 || null,
          location: {
            longitude: venue.location?.longitude || null,
            latitude: venue.location?.latitude || null
          },
        },
      });
    } else {
      venueId = req.body.venueId;
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: event.name || null,
        type: event.type || null,
        url: event.url || null,
        locale: event.locale || null,
        images: event.images || null,
        description: event.info || null,
        salesStart: event.sales.public.startDateTime || null,
        salesEnd: event.sales.public.endDateTime || null,
        localDate: localDate ? new Date(localDate) : null,
        localTime: event.dates?.start?.localTime || null,
        timezone: event.dates?.timezone || null,
        statusCode: event.dates?.status.code || null,
        category: event.classifications[0]?.segment?.name || '',
        postedById: event.userId, // Optional, if you want to update the user
        no_of_tickets : event.no_of_tickets,
        price : event.price,  
        venue: {
          connect: { id: venueId } // Ensure that venueId is correctly assigned
        },
        classifications: event.classifications || null
      },
    });

    res.status(200).json({ message: 'Event Updated', updatedEvent });
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    res.status(500).json({ error: `Error updating event ${eventId}` });
  }
};

export const getEventsByUserID = (req, res) => {
  
}


// Ping endpoint for server health check
export const ping = (req, res) => {
  try {
    res.status(200).json({ message: 'Server is up and running!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to ping server.' });
  }
};