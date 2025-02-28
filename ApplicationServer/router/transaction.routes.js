import express from "express";
import {
    createTransaction,
    getTransactions,
    getTransactionsByCourse 
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/transactions", getTransactions);
router.get("/transactions/course/:id", getTransactionsByCourse );
router.post("/transactions",createTransaction);


export default router;