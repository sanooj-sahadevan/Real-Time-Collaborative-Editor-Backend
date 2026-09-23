import { Router } from "express";

import { expressCallback } from "../utils/expressCallback.js";
import { UserController } from "../controllers/userController.js";
import { UserRepository } from "../repositories/userRepository.js";
import { UserService } from "../services/userService.js";
import { signupValidator } from "../middlewares/signupValidators.js";
import { loginValidator } from "../middlewares/loginValidator.js";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository.js";

const router = Router();

const repository = new UserRepository();
const service = new UserService(repository, new RefreshTokenRepository());
const controller = new UserController(service);

router
  .route("/signup")
  .post(signupValidator, expressCallback(controller.userSignup));

router
  .route("/login")
  .post(loginValidator, expressCallback(controller.userLogin));

router
  .route("/logout")
  .post(expressCallback(controller.userLogout));

router
  .route("/refresh")
  .post(expressCallback(controller.refreshToken));

router
  .route("/me")
  .get(protectRoute, expressCallback(controller.getMe));

export default router;
