import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = Router();

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' },
    );

    // Set token as HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure secure in production
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, isInstructor } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isInstructor,
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' },
    );

    // Set token as HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
