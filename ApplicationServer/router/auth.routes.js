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
      { id: user.id, username: user.username, email: user.email, isInstructor: user.isInstructor},
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    res.json({ token }); // Send the token in the response
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const isInstructor = (role === 'true')? true : false;
    const existingUser = await User.findOne({ name });
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

    res.status(201).json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
