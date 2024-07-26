import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const jwtSecret = "3f4d5b6a7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4"; // Use the same JWT secret as in the register and login routes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method);

    if (req.method !== 'GET') {
        console.log('Method not allowed:', req.method);
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authorization header missing or malformed');
        res.status(401).json({ message: 'Authorization header missing or malformed' });
        return;
    }

    const accessToken = authHeader.split(' ')[1];
    console.log('Access token:', accessToken);

    try {
        console.log('Verifying access token');
        const decoded: any = jwt.verify(accessToken, jwtSecret);
        const userId = decoded.userId;
        console.log('Token verified, userId:', userId);

        console.log('Finding user with ID:', userId);
        const user = await User.findById(userId).select('-password -accessToken -refreshToken'); // Exclude sensitive fields
        if (!user) {
            console.log('User not found:', userId);
            res.status(404).json({ message: 'User not found' });
            return;
        }

        console.log('User found:', user);
        res.status(200).json({ user });
        console.log('User profile sent successfully:', userId);
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
