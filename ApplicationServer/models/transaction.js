import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course', // Reference to the Course model
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User', // Reference to the User model
			required: true,
		},
		paymentAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: ['success', 'failed', 'pending'],
			required: true,
		},
		metadata: {
			type: Object,
			default: {}, // For any additional information related to the transaction
		},
		stripeSessionId: {
			type: String,
			required: true,
			unique: true, // Enforces uniqueness for each transaction
		},
	},
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
