import { configDotenv } from 'dotenv';
configDotenv();
import express from 'express';
import Stripe from 'stripe';
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRETKEY);
import User from '../models/user.js';
import Course from '../models/course.js';
import notificationManager from '../utills/notificationManager.js';
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    switch (event.type) {
      case 'payment_intent.created':
        // console.log("Payment Intent Created:", event.data.object.id);
        break;

      case 'payment_intent.succeeded':
        // console.log("Payment Intent Succeeded:", event.data.object.id);
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        // console.log('Checkout Session Completed:', session.id);
        // console.log('Metadata:', session.metadata);

        // Only enroll if payment was successful
        if (session.payment_status === 'paid') {
          await enrollUser(session); // Call async function
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});


const enrollUser = async (session) => {
  
  const courseId = session.metadata.courseId;
  const userId = session.metadata.userId;
  const paymentStatus = session.payment_status;

  try {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      console.error('User or Course not found');
      return;
    }

    // Add course to user if not already enrolled
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
      // console.log(`User ${userId} enrolled in course ${courseId}`);
    } else {
      // console.log(`User ${userId} already enrolled in course ${courseId}`);
    }

    // Add user to course if not already added
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    // Optional: Send notification to instructor
    await notificationManager.createNotification({
      type: 'student_enrolled',
      course: course._id,
      user: course.instructor,
      title: course.title,
      message: `A new student has been enrolled for course ${course.title}`,
      isTimeSensitive: false,
    });

    // console.log('Enrollment completed and notification sent');

  } catch (error) {
    console.error('Error during enrollment:', error.message);
  }
};


export default router;

