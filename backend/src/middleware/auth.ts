import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { Farmer } from "../models/Farmer";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      phone: string;
      role: string;
    };

    const user = await Farmer.findById(decoded.id).select(
      "_id phone role isActive"
    );
    if (!user || !user.isActive) {
      res.status(401).json({ error: "User not found or deactivated" });
      return;
    }

    req.user = { id: decoded.id, phone: decoded.phone, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
};
