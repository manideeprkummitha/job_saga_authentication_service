import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDb from '../../../lib/db';
import User from '../../../models/auth_user';
import axios from 'axios';
import dotenv from 'dotenv';
import runMiddleware from '@/utils/cors';
dotenv.config();
const jwtSecret = "3f4d5b6a7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4";
const USER_SERVICE_URL = "http://localhost:7002/api/user/create"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method);

    await runMiddleware(req, res); // Run CORS middleware
    console.log('CORS middleware applied.');

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { firstName, lastName, email, phone, password, country, city, userType } = req.body;  // Include city
    console.log('Request body:', req.body);

    if (!firstName || !lastName || !email || !phone || !password || !country || !city || !userType) {  // Validate city
        console.log('Validation failed: All fields are required');
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await connectDb();
        console.log('Connected to database.');

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully.');

        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            country,
            city,  // Add city
            userType,
        });
        console.log('Creating new user object:', newUser);

        const accessToken = jwt.sign({ userId: newUser._id }, jwtSecret, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: newUser._id }, jwtSecret, { expiresIn: '7d' });
        newUser.accessToken = accessToken;
        newUser.refreshToken = refreshToken;

        await newUser.save();
        console.log('Tokens saved to user.');

        // Call the User Management microservice to create the user
        const userManagementResponse = await axios.post(`${USER_SERVICE_URL}`, {
            firstName,
            lastName,
            email,
            phone,
            country,
            city,  // Add city
            userType,
            authServiceId: newUser._id,
        });

        console.log('User created in User Management:', userManagementResponse.data);

        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            refreshToken,
        });
        console.log('Response sent successfully.');
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
