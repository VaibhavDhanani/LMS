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
import authenticateToken from './middlewares/auth.middleware.js';
import courseDraft from './router/courseDraft.routes.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import webhookRoutes from './router/webhook.routes.js';
import transactionRoutes from './router/transaction.routes.js';
import paymentRoutes from './router/payment.routes.js';
import lectureRoutes from './router/lecture.routes.js';
import publicCourseRoutes from './router/publicCourse.routes.js';
import notificationRoutes from './router/notification.routes.js';
configDotenv();
const app = express();
connectDB();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins, // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods,
    credentials: true,
  }),
);


app.use('/api/stripe', webhookRoutes);
app.use('/api/payment',authenticateToken, paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api',publicCourseRoutes);
app.use('/api',authenticateToken
  , userRoutes, courseRoutes,courseDraft, enrollmentRoutes, reviewRoutes,transactionRoutes,lectureRoutes,notificationRoutes);
  app.use(
    '/api1',
    userRoutes,
    courseDraft,
    courseRoutes,
    enrollmentRoutes,
    reviewRoutes,
    transactionRoutes,
  );

  // // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // chatbot apis
// Store chat history (in a real app, you'd use a database)
let chatHistory = [];

// Routes
app.get('/api/messages', (req, res) => {
  res.json(chatHistory);
});

app.post('/api/messages', async (req, res) => {
  try {
    const { message } = req.body;

    // Save user message
    const userMessage = {
      id: chatHistory.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString(),
    };
    chatHistory.push(userMessage);

    try {
      // Generate response using Gemini
      const result = await model.generateContent(message);
      const response = result.response;
      const botResponse = response.text();
      
      // Create bot message
      const botMessage = {
        id: chatHistory.length + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date().toLocaleTimeString(),
      };
      chatHistory.push(botMessage);

      res.json(botMessage);
    } catch (aiError) {
      console.error('AI Error:', aiError);
      // Send a fallback message if AI fails
      const fallbackMessage = {
        id: chatHistory.length + 1,
        type: 'bot',
        content:
            "I apologize, but I'm having trouble processing your request at the moment. Could you please try again?",
        timestamp: new Date().toLocaleTimeString(),
      };
      chatHistory.push(fallbackMessage);
      res.json(fallbackMessage);
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});