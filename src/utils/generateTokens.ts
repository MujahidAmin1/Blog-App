import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/refreshToken";
import type { Types } from "mongoose";
import { UserRole } from "../models/user";

export async function generateTokens(
  userId: Types.ObjectId | string,
  role: UserRole,
) {
  // 1. Create the short-lived access token — same as before but 15min
  const accessToken = jwt.sign(
    { userId: String(userId) , role},
    process.env.JWT_SECRET as string,

    { expiresIn: "15m" },
  );

  // 2. Create a refresh token — a random string, NOT a JWT
  const refreshTokenValue = crypto.randomBytes(64).toString("hex");

  // 3. Set expiry — 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // 4. Save refresh token to MongoDB
  await RefreshToken.create({
    token: refreshTokenValue,
    userId: String(userId),
    expiresAt,
  });

  return { accessToken, refreshToken: refreshTokenValue };
}
