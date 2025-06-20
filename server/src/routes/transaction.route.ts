import express from "express";
import { getTransactions, addTransaction } from '../controllers/transaction.controller';
import { authorizeUser } from "../middleware/auth.middleware";

const transactionRoute = express.Router()

transactionRoute.get('/', authorizeUser, getTransactions)
transactionRoute.post('/', authorizeUser, addTransaction)

export default transactionRoute