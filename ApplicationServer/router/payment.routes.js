import express from 'express'
const router = express.Router();
import { configDotenv } from 'dotenv';
configDotenv();
import Stripe from 'stripe';
const stripeSecretKey = process.env.STRIPE_SECRETKEY;
const stripe = new Stripe(stripeSecretKey);
import Transaction from '../models/transaction.js';
import User from '../models/user.js';
import Course from '../models/course.js';
import notificationManager from "../utills/notificationManager.js";

const Frontend = process.env.FRONTEND_URI;
router.post('/verify/:id', async (req, res) => {
    const sessionId = req.params.id;
    const userId = req.user.id;
    const { courseId } = req.body;

    try {
        // Fetch the session object from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            // Handle case where session does not exist
            return res.status(404).json({
                message: 'Session not found',
            });
        }

        // Extract the payment status
        const paymentStatus = session.payment_status;

        // Check for an existing transaction with the same sessionId
        const existingTransaction = await Transaction.findOne({ stripeSessionId:sessionId });
   
        if (existingTransaction && existingTransaction.userId== userId && existingTransaction.courseId== courseId) {
            // If transaction exists, return its details
            return res.status(200).json({
                message: 'Transaction already exists',
                data: existingTransaction,
            });
        }
        

        // If no transaction exists, create a new one
        const newTransaction = new Transaction({
            stripeSessionId:sessionId,
            userId: session.metadata.userId,
            courseId: session.metadata.courseId,
            status: (paymentStatus==='paid')?"success":"failed",
            paymentAmount: session.amount_total / 100, // Amount in the database (converted from cents to main currency)
            createdAt: new Date(),
        });
        
        // Save the transaction in the database
        await newTransaction.save();

        // if(paymentStatus === 'paid'){

        //   // Fetch the user and course objects from the database
        //   const user = await User.findById(session.metadata.userId);
        //   const course = await Course.findById(session.metadata.courseId);

        //   // Add course to user's enrolledCourses if not already enrolled
        //   if (!user.enrolledCourses.includes(session.metadata.courseId)) {
        //     user.enrolledCourses.push(session.metadata.courseId);
        //     await user.save();
        //   }
          
        //   // Add user to course's enrolledStudents if not already added
        //   if (!course.enrolledStudents.includes(session.metadata.userId)) {
        //     course.enrolledStudents.push(session.metadata.userId);
        //     await course.save();
        //   }
        //   const notification = await notificationManager.createNotification({
        //     type: 'student_enrolled',
        //     course : course._id,
        //     user: course.instructor,
        //     title: course.title,
        //     message: `A new student has been enrolled for course ${course.title}`,
        //     isTimeSensitive: false,
        //   });
        // }
    

        // Return the newly created transaction details
        res.status(201).json({
            message: 'Transaction created successfully',
            data: newTransaction,
        }); 
    } catch (error) {
        console.error('Error handling payment session:', error);

        // Handle other potential errors
        res.status(500).json({
            message: 'An error occurred while processing the payment session',
            error: error.message,
        });
    }
});



router.post('/', async (req, res) => {
  const user = req.user; 
  const {course} = req.body;
  const { price, discountEnabled,discount } = course.pricing;
  const discountedPrice = price * (discountEnabled ? 1- (discount/100)  : 1);
  const lineItems = [
    {
      price_data: {
        currency: 'inr',
        product_data: {
          name: course.title,
          images: [course.thumbnail],
        },
        unit_amount: Math.round(discountedPrice*100),
      },
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${Frontend}/courses/${course._id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${Frontend}/courses/${course._id}?status=cancel&session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      courseId: course._id, // Pass courseId
      userId: user.id, 
    },
  });

  res.json({ id: session.id });
});

export default router;