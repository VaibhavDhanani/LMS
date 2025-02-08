import cors from 'cors';
import express from 'express';
import { configDotenv } from 'dotenv';
import Stripe from 'stripe';
import { GoogleGenerativeAI } from '@google/generative-ai';

import connectDB from './utills/dbConnection.js';
import authenticateToken from './middlewares/auth.middleware.js';

import authRoutes from './router/auth.routes.js';
import courseRoutes from './router/course.routes.js';
import reviewRoutes from './router/reviews.routes.js';
import userRoutes from './router/user.routes.js';
import courseDraft from './router/courseDraft.routes.js';
import webhookRoutes from './router/webhook.routes.js';
import transactionRoutes from './router/transaction.routes.js';
import paymentRoutes from './router/payment.routes.js';
import enrollmentRoutes from "./router/enrollment.routes.js";
import encodingRoute from "./router/encoding.routes.js";

// Load environment variables
configDotenv();

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Routes
app.use('/api/stripe', webhookRoutes);
app.use('/api/payment', authenticateToken, paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', authenticateToken, userRoutes, courseRoutes, courseDraft,encodingRoute, enrollmentRoutes, reviewRoutes, transactionRoutes);
app.use('/api1', userRoutes, courseDraft, courseRoutes, enrollmentRoutes, encodingRoute, reviewRoutes, transactionRoutes);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Chatbot API
let chatHistory = [];

app.get('/api/messages', (req, res) => {
  res.json(chatHistory);
});

app.post('/api/messages', async (req, res) => {
  try {
    const { message } = req.body;
    chatHistory.push({ id: chatHistory.length + 1, type: 'user', content: message, timestamp: new Date().toLocaleTimeString() });
    
    try {
      const result = await model.generateContent(message);
      const botResponse = result.response.text();
      chatHistory.push({ id: chatHistory.length + 1, type: 'bot', content: botResponse, timestamp: new Date().toLocaleTimeString() });
      res.json({ type: 'bot', content: botResponse });
    } catch (aiError) {
      console.error('AI Error:', aiError);
      const fallbackMessage = { id: chatHistory.length + 1, type: 'bot', content: "I apologize, but I'm having trouble processing your request. Please try again.", timestamp: new Date().toLocaleTimeString() };
      chatHistory.push(fallbackMessage);
      res.json(fallbackMessage);
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DRM API
app.post('/api/drm/token', (req, res) => {
  const token = {
    version: 1,
    com_key_id: process.env.AXINOM_COMMUNICATION_KEY_ID,
    message: {
      type: 'entitlement_message',
      version: 2,
      license: { duration_seconds: 3600, allow_persistence: true },
      content_keys_source: { inline: [{ id: 'your-content-key-id', usage_policy: 'Policy A' }] }
    }
  };
  res.json(token);
});

app.post('/api/encrypt-video', async (req, res) => {
  try {
    const { video, contentKeyId, key } = req.body;
    const encryptedVideo = await encryptVideoContent(video, key);
    const manifestUrl = generateDashManifest(encryptedVideo, contentKeyId);
    res.json({ encryptedVideo, manifestUrl });
  } catch (error) {
    console.error('Encryption failed:', error);
    res.status(500).json({ error: 'Encryption failed' });
  }
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
