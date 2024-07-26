import mongoose from 'mongoose';

const connectDb = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://maanideeprkummiitha:manideep1234@cluster0.kqecryf.mongodb.net/project_1?retryWrites=true&w=majority&appName=Cluster0';
  const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';

  console.log('Connecting to MongoDB with URI:', mongoUri);

  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB is already connected.');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
    //   useNewUrlParser: true, // Use the new URL parser
    //   useUnifiedTopology: true, // Use the new server discovery and monitoring engine
    //   serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
    //   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('MongoDB connected successfully.');
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error('Full error details:', error);
    throw error;
  }
};

export default connectDb;
