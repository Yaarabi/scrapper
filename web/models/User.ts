import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'expired';
  licenseKey: string;
  subscriptionExpiresAt: Date;
  price?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'expired'],
      default: 'active',
    },
    licenseKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    subscriptionExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    price: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if subscription is currently valid
UserSchema.methods.isSubscriptionValid = function (): boolean {
  if (this.status !== 'active') return false;
  return new Date() < new Date(this.subscriptionExpiresAt);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
