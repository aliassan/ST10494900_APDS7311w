//#region networking modules
import cors from "cors";
import express, { Express } from "express";
import rateLimit from "express-rate-limit";
import https from "https";
import helmet from "helmet"; // Added Helmet
import { httpsOptions } from "./https.config"
//#endregion networking modules

//#region routing modules
import userRoutes from "../routes/user.routes";
import authRoutes from "../routes/auth.routes";
import transactionRoutes from "../routes/transaction.route";
//#endregion routing modules

import { authorizeUser } from "../middleware/auth.middleware";
import { errorMessages } from "../utils/server.config.util";
const path = require("path");

class Server {
  private static instance: Server | undefined;
  private httpsServer?: https.Server; // Add this property
  private app: Express;
  private paths: { [key: string]: string };
  private port: number;

  constructor() {
    this.app = express();
    this.paths = {
      user: "/api/user/",
      auth: "/api/auth/",
      transaction: "/api/transaction/"
    };
    
    this.port = parseInt(process.env.PORT as string) || 3000;

    this.init();
  }

  public getApp() {
    return this.app;
  }

  private init() {
    this.checks();
    this.middleware();
    this.routes();
  }

  private checks() {
    if (process.env.NODE_ENV === undefined)
      throw new Error(errorMessages.nodeEnv);
    if (process.env.FRONTEND_URL === undefined)
      throw new Error(errorMessages.frontendUrl);
    if (process.env.SECRET_KEY === undefined)
      throw new Error(errorMessages.secretKey);
    if (process.env.DATABASE_URL === undefined)
      throw new Error(errorMessages.databaseUrl);
    // if (process.env.CHAIN_ID === undefined)
    //   throw new Error(errorMessages.chainId);
  }

  private middleware() {
    // Use Helmet with some sensible defaults
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your needs
          styleSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your needs
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", process.env.FRONTEND_URL as string],
        },
      },
      hsts: {
        maxAge: 63072000, // 2 years in seconds
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
    }));

    // Rate limiter
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Allow 100 requests per windowMs
      standardHeaders: true, // Return rate limit info in headers
      legacyHeaders: false, // Disable legacy headers
      message: 'Too many requests from this IP, please try again later',
      skipSuccessfulRequests: true, // Don't count successful requests (status < 400)
    });

    this.app.use(limiter);

    this.app.use(express.json());
    this.app.use(cors({ origin: process.env.FRONTEND_URL as string }));
  }

  private routes() {
    // Apply brute force protection to auth routes
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Allow 5 requests per windowMs
      message: 'Too many login attempts, please try again later'
    });
    this.app.use(this.paths.auth, authLimiter, authRoutes);
    // Regular routes
    this.app.use(this.paths.user, userRoutes);
    this.app.use(this.paths.transaction, transactionRoutes);
  }

  public listen() {
    this.httpsServer = https.createServer(httpsOptions, this.app).listen(this.port, () => {
      console.log(`helloworld: listening on port ${this.port}`);
    });

    return this.httpsServer;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }
}

const server = Server.getInstance();

export default server;