import cors from 'cors';
import { configDotenv } from 'dotenv';
import express from 'express';
import Stripe from 'stripe';
import authRoutes from './router/auth.routes.js';
import courseRoutes from './router/course.routes.js';
import enrollmentRoutes from './router/enrollment.routes.js';
import reviewRoutes from './router/reviews.routes.js';
import userRoutes from './router/user.routes.js';
import connectDB from './utills/dbConnection.js';

import courseDraft from './router/courseDraft.routes.js';
configDotenv();
const app = express();
connectDB();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: false, // Allow cookies or authentication headers
  }),
);
const port = process.env.PORT || 5000;

const stripeSecretKey = process.env.STRIPE_SECRETKEY;

const stripe = new Stripe(stripeSecretKey);
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes, courseRoutes, enrollmentRoutes, reviewRoutes);
app.use('/api/checkout', async (req, res) => {
  const course = req.body;
  // console.log(course)
  const lineItems = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: course.title,
          images: [
            'https://imgs.search.brave.com/-xm-3EXUVu0v3aVls5wGMx5e2kL3fxrr-57uApRt5GU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzcyLzcyLzcx/LzM2MF9GXzM3Mjcy/NzE5MF8xT2prVzBL/YXVHeTV4cjJPVFFD/ZDU1b0JBcVoxV3px/Ti5qcGc',
          ],
        },
        unit_amount: Math.round(course.price.discounted * 100),
      },
      quantity: 1,
    },
  ];
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: 'http://localhost:5173/success',
    cancel_url: 'http://localhost:5173/cancel',
  });
  res.json({ id: session.id });
});
app.use(
  '/api',
  userRoutes,
  courseDraft,
  courseRoutes,
  enrollmentRoutes,
  reviewRoutes,
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
