import db from '@/apis/database';
import { loadStripe } from '@stripe/stripe-js';

const stripePublishKey = import.meta.env.VITE_STRIPE_PUBLISHKEY

export const paymentService = async (course) => {
    try {
      const stripe = await loadStripe(stripePublishKey);
  
      const response = await db.post(`/payment`, course);
      const result = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });
  
      return { success: true, result }; // Explicit success response
    } catch (error) {
      console.error("Error in payment service:", error.message);
      return { error }; // Return error for upstream handling
    }
  };
  