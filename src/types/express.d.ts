import type { UserDoc } from "../models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: "user" | "admin";
      };
    }
  }
}

export {};