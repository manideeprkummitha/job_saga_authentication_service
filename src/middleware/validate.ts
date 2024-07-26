// validate.ts
// This middleware validates incoming request data for user registration and login
// using express-validator to ensure data integrity and correctness.

import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

// Middleware to validate user registration
const validateRegistration = [
    body('firstName').notEmpty().withMessage('First name is required.'),
    body('lastName').notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().withMessage('Email is not valid.'),
    body('phone').notEmpty().withMessage('Phone number is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('country').notEmpty().withMessage('Country is required.'),
    body('userType').isIn(['job seeker', 'recruiter']).withMessage('User type must be either job seeker or recruiter.'),
];

// Middleware to validate user login
const validateLogin = [
    body('email').isEmail().withMessage('Email is not valid.'),
    body('password').notEmpty().withMessage('Password is required.'),
];

// Function to check validation results
const checkValidationResults = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req); // Check for validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Respond with validation errors
    }
    next(); // Proceed to the next middleware or route handler
};

// Export combined validation middleware
export const validate = {
    registration: [...validateRegistration, checkValidationResults],
    login: [...validateLogin, checkValidationResults],
};
