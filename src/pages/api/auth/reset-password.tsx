import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/auth_user';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method);

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { email, otp, newPassword } = req.body;
    console.log('Request body:', req.body);

    if (!email || !otp || !newPassword) {
        console.log('All fields are required');
        res.status(400).json({ message: 'All fields are required' });
        return;
    }

    try {
        console.log('Finding user with email:', email);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires.getTime() < Date.now()) {
            console.log('Invalid or expired OTP');
            res.status(400).json({ message: 'Invalid or expired OTP' });
            return;
        }

        console.log('Hashing new password for user:', email);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        console.log('Password updated successfully');

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
