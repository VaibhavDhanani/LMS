import Stripe from 'stripe';
import Course from '../models/course.js'; // Adjust import based on your file structure
import Transaction from '../models/transaction.js';
import User  from '../models/user.js';
import { configDotenv } from 'dotenv';
configDotenv();

export const getTransactions = async (req, res)=>{
  try{
      const transactions = await Transaction.find();
      res.json({data:transactions});
    }
    catch(error){
      res.status(500).json({ error: error.message });
    }
  
}
const stripe = Stripe(process.env.STRIPE_SECRETKEY); // Replace with your actual Stripe secret key

export const createTransaction = async (req, res) => {
  try {
    const { sessionId } = req.body;  // Assuming sessionId is passed in the request body
    
    // Retrieve the session from Stripe using the session ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if a transaction with the same stripeSessionId already exists
    const existingTransaction = await Transaction.findOne({ stripeSessionId: sessionId });
    if (existingTransaction) {
      return res.status(400).json({ message: 'Transaction already recorded for this session' });
    }

    // Extract relevant information from the session
    const { metadata, amount_total, payment_status } = session;
    // console.log(session);
    
    // Validate course and user
    const course = await Course.findById(metadata.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(metadata.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Set the payment amount and status based on session details
    const paymentAmount = amount_total / 100;  // Assuming the amount is in cents, converting to dollars
    const status = payment_status === 'paid' ? 'success' : 'failed'; // Check if payment was successful

    // Create the transaction
    const transaction = await Transaction.create({
      courseId: metadata.courseId,
      userId: metadata.userId,
      stripeSessionId: sessionId,
      paymentAmount,
      status,
    });

    // If the payment was successful, update user and course
    if (status === 'success') {
      // Add course to user's enrolledCourses if not already enrolled
      if (!user.enrolledCourses.includes(metadata.courseId)) {
        user.enrolledCourses.push(metadata.courseId);
        await user.save();
      }

      // Add user to course's enrolledStudents if not already added
      if (!course.enrolledStudents.includes(metadata.userId)) {
        course.enrolledStudents.push(metadata.userId);
        await course.save();
      }
    }

    // Respond with a success message and the transaction
    res.status(201).json({ message: 'Transaction recorded successfully', transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const getCourseTransactions = async (courseId, startDate, endDate) => {
  try {
    
    // Build query object
    const query = { courseId, status: 'success' };
    
    // Add date filtering if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set time to end of day for the end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }

    // Fetch all successful transactions for this course
    const transactions = await Transaction.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: 1 });

    // Calculate total revenue
    const totalRevenue = transactions.reduce((sum, transaction) => {
      return sum + transaction.paymentAmount;
    }, 0);

    // Group transactions by month for chart data
    const monthlySales = transactions.reduce((acc, transaction) => {
      // Format date to get month name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const date = new Date(transaction.createdAt);
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const monthYear = `${month}`;
      
      // If month already exists in accumulator, add to it
      if (acc[monthYear]) {
        acc[monthYear].sales += transaction.paymentAmount;
        acc[monthYear].enrollments += 1;
      } else {
        // Otherwise create new entry
        acc[monthYear] = {
          month: monthYear,
          sales: transaction.paymentAmount,
          enrollments: 1
        };
      }
      
      return acc;
    }, {});
    
    // Convert to array format suitable for charts
    const monthlySalesArray = Object.values(monthlySales);
    
    return {
      success: true,
      data: {
        totalRevenue,
        totalEnrollments: transactions.length,
        transactions,
        monthlySales: monthlySalesArray
      }
    };
  } catch (error) {
    console.error('Error fetching course transactions:', error);
    return {
      success: false,
      message: 'Failed to fetch transaction data',
      error: error.message
    };
  }
};


export const getTransactionsByCourse = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { startDate, endDate } = req.query;
    
    const result = await getCourseTransactions(courseId, startDate, endDate);
    console.log(result);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in transaction controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing transaction data',
      error: error.message
    });
  }
};