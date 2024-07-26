import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/auth_user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const jwtSecret = "3f4d5b6a7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4";
const refreshTokenSecret = "another_secret_key_for_refresh_token"; // Use a different secret for refresh tokens

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method);

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { refreshToken } = req.body;
    console.log("Request body:", req.body);

    if (!refreshToken) {
        console.log('Refresh token is required');
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }

    try {
        console.log('Verifying refresh token');
        const decoded: any = jwt.verify(refreshToken, refreshTokenSecret);
        const userId = decoded.userId;
        console.log('Token verified, userId:', userId);

        console.log('Finding user with ID:', userId);
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }

        if (user.refreshToken !== refreshToken) {
            console.log('Refresh token mismatch for user:', userId);
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }

        console.log('Generating new access token for user:', userId);
        const newAccessToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

        // Optionally, you can also generate a new refresh token and save it
        // const newRefreshToken = jwt.sign({ userId: user._id }, refreshTokenSecret, { expiresIn: '7d' });
        // user.refreshToken = newRefreshToken;
        // await user.save();
        // console.log('New refresh token generated and saved for user:', userId);

        res.status(200).json({ accessToken: newAccessToken });
        console.log('New access token sent successfully:', newAccessToken);
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
