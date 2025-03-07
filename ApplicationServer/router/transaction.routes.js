import express from "express";
import {
    createTransaction,
    getTransactions,
    getTransactionsByCourse ,
    getSalesData,
    getUserTransactions
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/transactions", getTransactions);
router.get("/transactions/course/:id", getTransactionsByCourse );
router.get("/transactions/instructor/:id", getSalesData );
router.get("/transactions/user/:userId", getUserTransactions );

router.post("/transactions",createTransaction);


export default router;