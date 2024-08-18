// utils/emailUtils.js

import nodemailer from 'nodemailer';

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lucizodi@gmail.com', // Replace with your email
    pass: 'RandomPassword@21324'   // Replace with your email password
  }
});

/**
 * Send a purchase confirmation email to the user.
 * @param {Object} purchaseDetails - Details of the purchase.
 */
async function sendPurchaseConfirmationEmail(purchaseDetails) {
  
  try {
  console.log("here in sendPurchase1 ", purchaseDetails);
  const { firstName, lastName, email, eventName, location, localDate, localTime, numberOfTickets, totalPrice } = purchaseDetails;
  const date = new Date(purchaseDetails.localDate);

  const formattedDate = date.toLocaleDateString();
  
  console.log("here in sendPurchase2");

  const mailOptions = {
    from: 'lucizodi@gmail.com',
    to: email,
    subject: 'Ticket Purchase Confirmation',
    text: `
      Dear ${firstName}+${lastName},

      Thank you for your purchase!

      Event: ${eventName}
      Location: ${location}
      Date: ${formattedDate}
      Time: ${localTime}

      Number of Tickets: ${numberOfTickets}
      Total Price: $${totalPrice}

      We hope you enjoy the event!

      Best Regards,
      Event Management Team
    `
  };
  console.log("here in sendPurchase3 = ", mailOptions);

    console.log("here in mailUtil");
    await transporter.sendMail(mailOptions);
    console.log('Purchase confirmation email sent successfully.');
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
    throw new Error('Failed to send purchase confirmation email');
  }
}

export { sendPurchaseConfirmationEmail };
