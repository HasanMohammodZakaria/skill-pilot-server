import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

export interface UserDoc {
  _id: ObjectId;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export function UserCollection() {
  return getDB().collection<UserDoc>("user");
}