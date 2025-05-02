import express from "express";
import { /*authenticateToken, */authenticateUser } from "../controllers/auth.controller";
// import { authorizeUser } from "../middleware/authMiddleware";
const authRoutes = express.Router();

authRoutes.post("/", authenticateUser);
// authRoutes.get("/token", authorizeUser, authenticateToken);

export default authRoutes;
