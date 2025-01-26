import db from "@/apis/database";

export const createTransaction = async (sessionId, token) => {
    try {
        console.log(sessionId);
        let obj ={
            sessionId: sessionId,
        }
        // Making the API request to create the transaction
        const response = await db.post('/transactions', obj,{
            headers: { authorization: `Bearer ${token}` },
        });

        // Returning the response data (transaction created)
        return response.data;
    } catch (error) {
        console.error('Error creating transaction:', error.message);
        throw error; // You can throw the error to be handled by the calling function
    }
};
      