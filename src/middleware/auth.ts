// auth.ts
// This middleware checks for a valid JWT in the Authorization header
// and attaches the decoded user information to the request object.

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Middleware to authenticate JWT
const auth = (req: Request, res: Response, next: NextFunction) => {
    // Extract token from authorization header
    const token = req.headers['authorization']?.split(" ")[1];

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify the token using the secret key from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded; // Attach decoded user info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(400).json({ message: "Invalid token." });
    }
};

export default auth;
