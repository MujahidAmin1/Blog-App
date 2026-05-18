import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/user";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = header.substring(7);
    const secret = process.env["JWT_SECRET"] as string;
    if (!secret) return res.status(500).json({ message: "JWT secret missing" });
    const payload = jwt.verify(token, secret) as {
      userId: string;
      role: UserRole;
    };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "invalid token" });
  }
}

export default requireAuth;
