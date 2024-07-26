import Cors, { CorsOptions } from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000', // Add your local development URL
  // Add more allowed origins as needed
];

// Initialize the CORS middleware
const corsOptions: CorsOptions = {
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  origin: (origin: string | undefined, callback: (error: Error | null, origin?: string | boolean) => void) => {
    if (process.env.NODE_ENV === 'production') {
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
};

const cors = Cors(corsOptions);

// Function to run the middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    cors(req, res, (result: Error | void) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve();
    });
  });
};

export default runMiddleware;
