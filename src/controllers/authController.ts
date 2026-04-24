import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";
import { generateTokens } from "../utils/generateTokens";
import RefreshToken from "../models/refreshToken";

// register a new user

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();

    const { accessToken, refreshToken } = await generateTokens(
      user._id,
      user.role,
    );

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: String(user._id), name, email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed" });
  }
}

// Login an existing user

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const { accessToken, refreshToken } = await generateTokens(
      user._id,
      user.role,
    );

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: String(user._id), name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
}

// token refresh
export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    if (stored.expiresAt < new Date()) {
      await stored.deleteOne();
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // 3. Delete the old refresh token — this is the rotation step
    await stored.deleteOne();
    const user = await User.findById(stored.userId);
    if (!user) {
      await stored.deleteOne();
      return res.status(401).json({ message: "User not found" });
    }

    // 4. Issue a brand new access token + refresh token pair
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      stored.userId,
      user.role,
    );

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Token refresh failed" });
  }
}

// Logout

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
}

export default { register, login, refresh, logout };
