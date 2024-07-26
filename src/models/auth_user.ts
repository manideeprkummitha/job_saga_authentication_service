import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    country: string;
    city: string;  
    userType: string;
    accessToken?: string;
    refreshToken?: string;
    otp?: string;
    otpExpires?: Date;
}

const UserSchema: Schema<IUser> = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },  
    userType: { type: String, required: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
});

const User: Model<IUser> = mongoose.models.user_auth || mongoose.model<IUser>('user_auth', UserSchema);
export default User;
