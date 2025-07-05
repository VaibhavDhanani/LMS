import db from '@/apis/database';
import { loadStripe } from '@stripe/stripe-js';

const stripePublishKey = import.meta.env.VITE_STRIPE_PUBLISHKEY

  export const paymentService = async (course, token) => {
    try {
      const stripe = await loadStripe(stripePublishKey);

      const response = await db.post(`/payment`, { course: course }, {
        headers: { authorization: `Bearer ${token}` },
      });
      const result = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });
      return { success: true, data: result }; // Explicit success response
    } catch (error) {
      console.error("request declined :", error.response.message);
      return { error }; // Return error for upstream handling
    }
  };

export const verifyPayment = async (sessionId,courseId, token) => {
  try {
    let obj ={
      courseId: courseId,
      sessionId: sessionId,
    }
    const response = await db.post(`/payment/verify/${sessionId}`, obj, {
      headers: { 'authorization': `Bearer ${token}` },
    });
    return response.data;
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};

