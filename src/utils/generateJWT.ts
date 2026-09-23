import jwt, { type SignOptions } from "jsonwebtoken";
import { JWT_SECRET } from "./constants.js";
import { randomUUID } from "node:crypto";

export function generateAccessToken(id: string, role: string): string {
  try {
    const payload = { id, role };

    const options: SignOptions = {
      expiresIn: "1h",
    };

    return jwt.sign(payload, JWT_SECRET(), options);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate access token";

    throw new Error(message);
  }
}

export function generateRefreshToken(id: string, role: string, familyId: string): string {
  try {
    const payload = { id, role, familyId };

    const options: SignOptions = {
      expiresIn: "7d",
      jwtid: randomUUID(),
    };

    return jwt.sign(payload, JWT_SECRET(), options);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate refresh token";

    throw new Error(message);
  }
}