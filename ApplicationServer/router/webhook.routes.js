// webhook.routes.js

import { configDotenv } from 'dotenv';
configDotenv();
import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRETKEY);

router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  console.log("Raw Body:", req.body.toString());
  console.log("Headers:", req.headers);
  console.log("1. Webhook endpoint hit!"); // Debug log

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log("2. Webhook Secret:", endpointSecret); // Debug log
  
  const sig = req.headers['stripe-signature'];
  console.log("3. Stripe Signature:", sig); // Debug log
  
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("4. Event constructed successfully:", event.type); // Debug log

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('5. Payment succeeded:', session); // Debug log
        console.log('6. Metadata:', session.metadata); // Debug log

        // Example: Update enrollment in the database
        enrollUser(session);
        break;

      case 'payment_intent.succeeded':
        console.log('7. Payment Intent succeeded:', event.data.object);
        break;

      default:
        console.log(`8. Unhandled event type ${event.type}`);
    }

    // Respond with 200 OK to acknowledge receipt of the event
    console.log("9. Sending success response"); // Debug log
    res.status(200).json({ received: true });
    
  } catch (err) {
    console.error('10. Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Example function for enrollment logic
const enrollUser = (session) => {
  console.log("11. Enrolling user"); // Debug log
  // Extract relevant data
  const courseId = session.metadata.courseId;
  const userId = session.metadata.userId;
  const paymentStatus = session.payment_status;

  console.log(`12. Enrollment details: courseId=${courseId}, userId=${userId}, status=${paymentStatus}`);
};

export default router;