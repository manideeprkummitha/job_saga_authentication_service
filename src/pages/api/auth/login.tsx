// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/auth_user';
import runMiddleware from '@/utils/cors'; // Adjust the import path as needed
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request:', req.method, req.url);

  await runMiddleware(req, res); // Run CORS middleware
  console.log('CORS middleware applied.');

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { email, password } = req.body;
  console.log('Request body:', req.body);

  if (!email || !password) {
    console.log('Missing email or password');
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    console.log('Checking if user exists with email:', email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found:', email);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    console.log('Comparing passwords for user:', email);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    console.log('Generating access and refresh tokens for user:', user._id);
    const accessToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    console.log('Saving tokens to user:', user._id);
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    console.log('Tokens saved successfully, responding with tokens.');
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
