import axios from 'axios';
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function syncEventsAndVenues(filters) {
  try {
    
    // Construct the API URL with filters
    let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=AmsLFYVpfYKZOBTRU7vxz9Z2Fs3hEC8m`;

    // Append filters to URL
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
    }
    
    const response = await axios.get(url);
    const eventsData = response.data._embedded.events;

    // Extract and Sync Venues
    const venuesSet = new Set();
    for (const event of eventsData) {
      if (event._embedded && event._embedded.venues) {
        for (const venue of event._embedded.venues) {
          venuesSet.add(venue); // Collect unique venues
        }
      }
    }

    const venuesArray = Array.from(venuesSet);

    await syncVenues(venuesArray);
    await syncEvents(eventsData);
  } catch (error) {
    console.error('Error syncing events and venues:', error);
  }
}


async function syncVenues(venues) {
  if (!Array.isArray(venues)) {
    throw new TypeError('Expected an array of venues');
  }

  for (const venue of venues) {
    try {
      await prisma.venue.upsert({
        where: { id: venue.id },
        update: {
          name: venue.name || null,
          postalCode: venue.postalCode || null,
          city: venue.city.name || null,
          state: venue.state.stateCode || null,
          country: venue.country.countryCode || null,
          address: venue.address.line1 || null
        },
        create: {
          id: venue.id,
          name: venue.name || null,
          postalCode: venue.postalCode  || null,
          city: venue.city.name || null,
          state: venue.state.stateCode || null,
          country: venue.country.countryCode || null,
          address: venue.address.line1 || null
        },
      });
    } catch (error) {
      console.error(`Error syncing venue ${venue.id}:`, error);
    }
  }
}

async function syncEvents(eventsData) {
  if (!Array.isArray(eventsData)) {
    throw new TypeError('Expected an array of venues');
  }

  // Sync Events
  for (const event of eventsData) {
    const localDate = event.dates?.start?.localDate
        ? `${event.dates.start.localDate}T00:00:00Z`
        : new Date().toISOString();
    const venueId = event._embedded.venues && event._embedded.venues[0]?.id || null;

    try {
      await prisma.event.upsert({
        where: { id: event.id },
        update: {
          name: event.name || null,
          type: event.type || null,
          url: event.url || null,
          locale: event.locale || null,
          images: event.images || null,
          description: event.info || null,
          salesStart: event.sales.public.startDateTime || null,
          salesEnd: event.sales.public.endDateTime || null,
          localDate: localDate ? new Date(localDate) : null,
          localTime : event.dates?.start?.localTime || null,
          timezone: event.dates.timezone || null,
          statusCode: event.dates.status.code || null,
          category: event.classifications[0]?.segment?.name || '',
          venue: {
            connect: { id: venueId }  // Ensure that venueId is correctly assigned
          },
          classifications: event.classifications || null,
        },
        create: {
          id: event.id,
          name: event.name || null,
          type: event.type || null,
          url: event.url || null,
          locale: event.locale || null,
          images: event.images || null,
          description: event.info || null,
          salesStart: event.sales.public.startDateTime || null,
          salesEnd: event.sales.public.endDateTime || null,
          localDate: localDate ? new Date(localDate) : null,
          localTime : event.dates?.start?.localTime || null,
          timezone: event.dates.timezone || null,
          statusCode: event.dates.status.code || null,
          category: event.classifications[0]?.segment?.name || '',
          venue: {
            connect: { id: venueId }  // Ensure that venueId is correctly assigned
          },
          classifications: event.classifications || null
        },
      });
    } catch (error) {
      console.error(`Error syncing venue ${venueId}:`, error);
    }
  }
}

export { syncEventsAndVenues };