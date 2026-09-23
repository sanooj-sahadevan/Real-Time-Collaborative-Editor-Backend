import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { IUserRepository } from "../repositories/userRepository.js";
import {generateAccessToken,generateRefreshToken} from "../utils/generateJWT.js";

import { BCRYPT_SALT, JWT_SECRET } from "../utils/constants.js";
import { randomUUID } from "node:crypto";
import type { RefreshTokenRepository } from "../repositories/refreshTokenRepository.js";

interface SignupData {
  username: string;
  email: string;
  phone: string;
  password: string;
  age: number;
}

export class UserService {
  private repository: IUserRepository;

  constructor(repository: IUserRepository, private readonly refreshTokens: RefreshTokenRepository) {
    this.repository = repository;
  }

  async userSignup(userData: SignupData) {
    const existingUser = await this.repository.getUserByEmail(userData.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT());

    const hashedPassword = await bcrypt.hash(
      userData.password,
      salt
    );

    const newUser = await this.repository.addUser({
      ...userData,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(
      newUser._id.toString(),
      "user"
    );

    const familyId = randomUUID();
    const refreshToken = generateRefreshToken(newUser._id.toString(), "user", familyId);
    await this.refreshTokens.create(newUser._id.toString(), familyId, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const userObj = newUser.toObject();

    delete userObj.password;

    return {
      user: userObj,
      accessToken,
      refreshToken,
    };
  }

  async userLogin(email: string, password: string) {
    const user = await this.repository.getUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(
      user._id.toString(),
      "user"
    );

    const familyId = randomUUID();
    const refreshToken = generateRefreshToken(user._id.toString(), "user", familyId);
    await this.refreshTokens.create(user._id.toString(), familyId, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const userObj = user.toObject();

    delete userObj.password;

    return {
      user: userObj,
      accessToken,
      refreshToken,
    };
  }

  async getUserById(id: string) {
    const user = await this.repository.getUserById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async rotateRefreshToken(refreshToken: string) {
    const decoded = jwt.verify(refreshToken, JWT_SECRET()) as { id: string; role: string; familyId: string };
    if (!decoded.id || !decoded.familyId) throw new Error("Invalid refresh token");
    const replacement = generateRefreshToken(decoded.id, decoded.role, decoded.familyId);
    await this.refreshTokens.rotate(refreshToken, replacement, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    return { accessToken: generateAccessToken(decoded.id, decoded.role), refreshToken: replacement };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) await this.refreshTokens.revokeFamily(refreshToken);
  }
}