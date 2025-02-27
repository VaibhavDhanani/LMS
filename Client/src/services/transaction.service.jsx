import db from "@/apis/database";
export const getCourseTransactions = async (courseId, token, params = {}) => {
    try {
      const response = await db.get(`/transactions/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      
      return {
        success : true,
        data : response.data.data,
        message : response.data.message || 'Transactions fetched successfully'
    };
    } catch (error) {
      console.error('Error fetching course transactions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch transaction data'
      };
    }
  };