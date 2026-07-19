import type { Request, Response, NextFunction } from "express";
import type { Auth } from "../config/auth.config.js";

export function createAuthMiddleware(auth: Auth) {
  return async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") headers.append(key, value);
      }

      const session = await auth.api.getSession({ headers });

      if (!session || !session.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please log in.",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role ?? "user",
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }
  };
}

