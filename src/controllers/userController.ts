import { UserService } from "../services/userService.js";

export class UserController {
  private service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  userSignup = async (httpRequest: any) => {
    try {
      const { user, accessToken, refreshToken } = await this.service.userSignup(
        httpRequest.body
      );

      return {
        statusCode: 201,
        body: { message: "User registered successfully", user },
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      return {
        statusCode: 400,
        body: { error: e.message },
      };
    }
  };

  userLogin = async (httpRequest: any) => {
    try {
      const { email, password } = httpRequest.body;
      const { user, accessToken, refreshToken } = await this.service.userLogin(
        email,
        password
      );

      return {
        statusCode: 200,
        body: { message: "User logged in successfully", user },
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      return {
        statusCode: 400,
        body: { error: e.message },
      };
    }
  };

  userLogout = async (httpRequest: any) => {
    await this.service.logout(httpRequest.cookies?.refreshToken);
    return {
      statusCode: 200,
      body: { message: "Logged out successfully" },
      accessToken: "", // clear access token
      refreshToken: "", // clear refresh token
    };
  };

  refreshToken = async (httpRequest: any) => {
    try {
      const refreshToken = httpRequest.cookies?.refreshToken;

      if (!refreshToken) {
        return { statusCode: 401, body: { error: "Refresh token not found" } };
      }

      const tokens = await this.service.rotateRefreshToken(refreshToken);

      return {
        statusCode: 200,
        body: { message: "Token refreshed successfully" },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (e: any) {
      return {
        statusCode: 403,
        body: { error: "Invalid refresh token" },
      };
    }
  };

  getMe = async (httpRequest: any) => {
    try {
      const userId = httpRequest.user?.id;
      if (!userId) {
        return { statusCode: 401, body: { error: "Unauthorized" } };
      }

      const user = await this.service.getUserById(userId);

      return {
        statusCode: 200,
        body: { user },
      };
    } catch (e: any) {
      return {
        statusCode: 400,
        body: { error: e.message },
      };
    }
  };
}
