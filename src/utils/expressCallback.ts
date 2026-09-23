import type { NextFunction, Request, Response } from "express";

export function expressCallback(controller: unknown) {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const httpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      method: req.method,
      path: req.path,
      cookies: req.cookies,
      user: (req as any).user,
      headers: {
        "Content-Type": req.get("Content-Type"),
        Referer: req.get("referer"),
        "User-Agent": req.get("User-Agent"),
      },
    };

    try {
      if (typeof controller !== "function") {
        throw new Error("Controller must be a function");
      }

      const httpResponse = await controller(httpRequest);

      if (httpResponse.headers) {
        res.set(httpResponse.headers);
      }

      if (httpResponse.accessToken !== undefined) {
        if (httpResponse.accessToken === "") {
          res.clearCookie("accessToken");
        } else {
          res.cookie("accessToken", httpResponse.accessToken, {
            httpOnly: false,
          });
        }
      }

      if (httpResponse.refreshToken !== undefined) {
        if (httpResponse.refreshToken === "") {
          res.clearCookie("refreshToken");
        } else {
          res.cookie("refreshToken", httpResponse.refreshToken, {
            httpOnly: true,
          });
        }
      }

      res.type("json");
      res
        .status(httpResponse.statusCode)
        .send(httpResponse.body);
    } catch (e: unknown) {
      next(e);
    }
  };
}