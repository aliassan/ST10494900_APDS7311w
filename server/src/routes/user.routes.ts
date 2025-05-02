import express from "express";
import {
  getUser,
  addUser,
} from "../controllers/user.controller";
import { authorizeUser } from "../middleware/auth.middleware";
const userRoutes = express.Router();

userRoutes.post("/:accountNumber", authorizeUser, getUser);
userRoutes.post("/", addUser);
export default userRoutes;
