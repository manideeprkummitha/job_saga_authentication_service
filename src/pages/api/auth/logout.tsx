import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/auth_user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method);

    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { accessToken } = req.body;
    console.log("Request body:", req.body);

    if (!accessToken) {
        res.status(400).json({ message: 'Access token is required' });
        return;
    }

    try {
        const decoded: any = jwt.verify(accessToken, process.env.JWT_SECRET as string);
        const userId = decoded.userId;

        console.log('Finding user with ID:', userId);
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        console.log('Clearing tokens for user:', userId);
        user.accessToken = '';
        user.refreshToken = '';
        await user.save();

        console.log('Tokens cleared for user:', userId);
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
