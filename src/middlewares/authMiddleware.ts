import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants.js";

export const protectRoute = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new Error("Not authorized to access this route");
    }

    const decoded = jwt.verify(token, JWT_SECRET());

    (req as any).user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      error: "Not authorized to access this route",
    });
  }
};