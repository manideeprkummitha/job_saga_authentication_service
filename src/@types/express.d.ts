// express.d.ts
// This file extends the Express Request interface to include a custom 'user' property.
// This is necessary for TypeScript to recognize 'req.user' in middleware,
// allowing for type safety when handling authenticated user data.

import { IUser } from '../models/auth_user'; // Import the IUser interface from the User model
import * as express from 'express'; // Import Express types

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Adding optional 'user' property to the Request interface
    }
  }
}
