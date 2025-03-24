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

export const getOverallSalesData = async (token,params ={})=>{
  try {

    const response = await db.get(`/transactions/instructor`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params
    });
    
    return {
      success : true,
      data : response.data.data,
      message : response.data.message || 'Overall sales data fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching overall sales data:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch overall sales data'
    };
  }
}

export const getUserTransactions = async (token)=>{
  try{

    const response = await db.get(`/transactions/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success : true,
      data : response.data.data,
      message : response.data.message || 'User transactions fetched successfully'
    };
  }catch(e){
    console.error('Error fetching user transactions:', e);
    return {
      success: false,
      message: e.response?.data?.message || 'Failed to fetch user transaction data'
    };
  }
}