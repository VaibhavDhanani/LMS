import db from '@/apis/database';
import { loadStripe } from '@stripe/stripe-js';

const stripePublishKey = import.meta.env.VITE_STRIPE_PUBLISHKEY

export const paymentService = async (course,user) => {
    try {
      const stripe = await loadStripe(stripePublishKey);
  
      const response = await db.post(`/payment`, {course: course, user: user});
      const result = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });
      return { success: true, data:result }; // Explicit success response
    } catch (error) {
      console.error("request declined :", error.response.message);
      return { error }; // Return error for upstream handling
    }
  };
  
