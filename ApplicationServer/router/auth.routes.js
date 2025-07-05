import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
const router = Router();
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { configDotenv } from "dotenv";
configDotenv();
// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, isInstructor: user.isInstructor},
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    res.json({ data: {token} }); // Send the token in the response
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const isInstructor = (role === 'true')? true : false;
    const existingUser = await User.findOne({
      email: email }  // Search by email
      );
    
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isInstructor,
    });
    await newUser.save();
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, isInstructor: newUser.isInstructor},
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' },
    );

    res.status(201).json({ data: {token} });
  } catch (error) {
    res
    .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
});


// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post("/google-signup", async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token || !role) {
      return res.status(400).json({ message: "Token and role are required" });
    }

    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`
    );

    const { name, email, id: googleId, picture } = data;
    const isInstructor = role === "true";

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (no password for Google users)
      user = new User({ name, email, googleId, isInstructor , profilePicture: picture });
      await user.save();
    }else{
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email, isInstructor: user.isInstructor },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({ data: { token: jwtToken } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
    console.log(error);
  }
});



router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body; // This is the access token from frontend
    if (!token) return res.status(400).json({ message: "Token is required" });

    // Fetch user info from Google using the Access Token
    const { data } = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { name, email, picture } = data;

    // Check if user exists in database
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email, isInstructor: user.isInstructor },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ data: { token: jwtToken }, message: "Login successful" });

  } catch (error) {
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
});

export default router;
