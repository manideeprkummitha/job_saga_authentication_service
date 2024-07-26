import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/auth_user';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method);

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { email } = req.body;
    console.log('Request body:', req.body);

    if (!email) {
        console.log('Email is required');
        res.status(400).json({ message: 'Email is required' });
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

        console.log('Generating OTP');
        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 3600000); // OTP expires in 1 hour
        await user.save();
        console.log('OTP saved to user:', otp);

        console.log('Sending OTP email');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
