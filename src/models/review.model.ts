import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

export interface ReviewDoc {
  _id?: ObjectId;
  blueprintId: ObjectId;
  userId: ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export function ReviewCollection() {
  return getDB().collection<ReviewDoc>("reviews");
}