import { timeStamp } from "node:console";
import mongoose, { Schema, Document, Model } from "mongoose";

// Define the allowed roles as a TypeScript union type
export type UserRole = 'user' | 'admin';
//                       ▲         ▲
//          only these two strings are valid
//          TypeScript will error if you try to assign anything else

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // admins are created manually or via a seeding script
      // never via a public API endpoint
  },
  { timestamps: true },
);

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
