import express from "express";
import {
    createTransaction,
    getTransactions
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/transactions", getTransactions);
router.post("/transactions",createTransaction);


export default router;