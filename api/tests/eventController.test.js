import request from 'supertest';
import app  from '../index';
// const app = require('../server'); // Update this path to your app file
import { syncEventsAndVenues } from '../util/syncAPI';
import { updateExpiredEvents } from '../util/eventUtils';
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

jest.mock('../util/syncAPI');
jest.mock('../util/eventUtils');
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    event: {
      findMany: jest.fn(),
    },
    venue: {
      findMany: jest.fn(), // Add this line
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Event Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test getAllEvents
  it('should return all events based on filters', async () => {
    syncEventsAndVenues.mockResolvedValue(); // Mock syncEventsAndVenues
    updateExpiredEvents.mockResolvedValue(); // Mock updateExpiredEvents

    const mockEvents = [{ id: 'event123', name: 'Test Event' }];
    prisma.event.findMany = jest.fn().mockResolvedValue(mockEvents);

    const mockFilteredVenues = [{ id: 'venue1' }, { id: 'venue2' }];
    prisma.venue.findMany = jest.fn().mockResolvedValue(mockFilteredVenues);


    const response = await request(app).get('/events?postalCode=12345');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockEvents);
  });

  // Test getEventById
  it('should return event details by ID', async () => {
    const mockEvent = { id: 'event123', name: 'Test Event', venueId: 'venue123' };
    const mockVenue = { id: 'venue123', name: 'Test Venue' };
    prisma.event.findUnique = jest.fn().mockResolvedValue(mockEvent);
    prisma.venue.findUnique = jest.fn().mockResolvedValue(mockVenue);

    const response = await request(app).get('/events/event123');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ...mockEvent, venue: mockVenue });
  });

  it('should return 404 if event not found', async () => {
    prisma.event.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app).get('/events/event123');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: 'Event not found.' });
  });

});