import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import authenticateToken from "../middlewares/auth.middleware.js";
import Chat from "../models/chat.js"; // Import Chat model

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


router.get("/messages", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({ userId });

    res.json(chats);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/messages", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const userId = req.user.id;
    
    let chat = await Chat.findOne({ userId, active: true });

    if (!chat) {
      chat = new Chat({
        userId,
        messages: [],
      });
    }

    const userMessage = {
      id: chat.messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    chat.messages.push(userMessage);

    const result = await model.generateContent(message + " Give me answer in brief.");
    const response = result?.response?.text?.() || 
                     "I apologize, but I'm having trouble processing your request.";

    const botMessage = {
      id: chat.messages.length + 1,
      type: "bot",
      content: response,
      timestamp: new Date().toISOString(),
    };
    // console.log(botMessage)

    chat.messages.push(botMessage);
    await chat.save();

    res.json(botMessage);
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
