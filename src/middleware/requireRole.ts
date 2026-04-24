import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth";
import type { UserRole } from "../models/user";

export function requireRole(...roles: UserRole[]) {
//                           ▲
//          rest parameter — accepts any number of role arguments
//          requireRole('admin')           → roles = ['admin']
//          requireRole('admin', 'editor') → roles = ['admin', 'editor']

  // requireRole returns a middleware function
  // this is a function that returns a function — called a factory
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      // requireAuth hasn't run yet — wrong middleware order
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.userRole)) {
      // user's role is not in the allowed list
      return res.status(403).json({ message: "Forbidden" });
      //              ▲
      //    403 not 401 — user IS authenticated
      //    but doesn't have PERMISSION for this resource
    }

    next();
  };
}

export default requireRole;