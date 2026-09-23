import { createHash } from "node:crypto";
import RefreshToken from "../models/RefreshToken.js";

export const hashRefreshToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class RefreshTokenRepository {
  async create(userId: string, familyId: string, token: string, expiresAt: Date) {
    return await RefreshToken.create({ userId, familyId, tokenHash: hashRefreshToken(token), expiresAt });
  }

  async findByToken(token: string) {
    return await RefreshToken.findOne({ tokenHash: hashRefreshToken(token) });
  }

  async rotate(token: string, replacementToken: string, expiresAt: Date) {
    const tokenHash = hashRefreshToken(token);
    const replacementHash = hashRefreshToken(replacementToken);
    const current = await RefreshToken.findOneAndUpdate(
      { tokenHash, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } },
      { $set: { revokedAt: new Date(), replacedBy: replacementHash } },
      { new: false }
    );
    if (!current) {
      const existing = await RefreshToken.findOne({ tokenHash });
      if (!existing) throw new Error("Refresh token is invalid");
      await RefreshToken.updateMany({ familyId: existing.familyId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
      throw new Error("Refresh token reuse detected");
    }
    await RefreshToken.create({ userId: current.userId, familyId: current.familyId, tokenHash: replacementHash, expiresAt });
    return current;
  }

  async revokeFamily(token: string) {
    const current = await this.findByToken(token);
    if (current) await RefreshToken.updateMany({ familyId: current.familyId }, { $set: { revokedAt: new Date() } });
  }
}