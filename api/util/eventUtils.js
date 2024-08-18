// utils/eventUtils.js
import pkg from "@prisma/client";


const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Update the status of events to 'expired' if the current date is past the localDate.
 * @returns {Promise<number>} - Number of events updated to 'expired'.
 */
async function updateExpiredEvents() {
  try {
    const currentDate = new Date(); // Get current date and time

    // Find events where localDate is less than the current date and statusCode is not already 'expired'
    const result = await prisma.event.updateMany({
      where: {
        localDate: {
          lt: currentDate, // Events with localDate in the past
        },
        statusCode: {
          not: 'expired', // Ensure we are not updating already expired events
        },
      },
      data: {
        statusCode: 'expired', // Set the status to 'expired'
      },
    });

    console.log(result);

    // Return the count of updated events
    return result.count;
  } catch (err) {
    console.error('Error updating expired events:', err);
    throw new Error('Failed to update expired events');
  } finally {
    await prisma.$disconnect();
  }
}

export { updateExpiredEvents };
