import db from '../apis/database.js'

export const scheduleLecture = async (lecture,token)=>{
    const response = await db.post('/lectures',lecture, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data;
}

export const fetchLectures = async (userId, token) => {
  try {
    const response = await db.get(`/lectures/instructor/${userId}`, {
      headers: { authorization: `Bearer ${token}` },
    });

    return {
      success: true,
      message: response.data.message||"Lectures fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching lectures:", error);

    return {
      success: false,
      message: "Failed to fetch lectures. Please try again later.",
      data: null,
    };
  }
};
export const fetchStudentLectures = async (userId, token) => {
  try {
    const response = await db.get(`/lectures/student/${userId}`, {
      headers: { authorization: `Bearer ${token}` },
    });

    return {
      success: true,
      message: response.data.message||"Lectures fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching lectures:", error);

    return {
      success: false,
      message: "Failed to fetch lectures. Please try again later.",
      data: null,
    };
  }
};

export const updateLecture = async (lectureId, lecture,token)=>{
  try{
    const response = await db.put(`/lectures/${lectureId}`,lecture,{
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message||"Lectures updated successfully",
      data: response.data.data,
    }; 
  }catch (error) {
    console.error("Error updating lectures:", error);

    return {
      success: false,
      message: "Failed to update lectures. Please try again later.",
      data: null,
    };
  }
};

export const deleteLecture = async(lectureId,token) => {
  try{
    const response = await db.delete(`lectures/${lectureId}`,{
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message||"Lectures deleted successfully",
      data: response.data.data,
    }; 
  }catch (error) {
    console.error("Error deleting lectures:", error);

    return {
      success: false,
      message: "Failed to delete lectures. Please try again later.",
      data: null,
    };
  }
};

export const startLecture = async (lectureId, userId, token) => {
  try {
    const response = await db.post(
      `/lectures/startlecture/${lectureId}`, 
      {}, // Empty request body
      {
        headers: { Authorization: `Bearer ${token}` }, // Corrected header format
      }
    );

    return {
      success: true,
      message: response.data.message || "Lecture started successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error occurred while starting lecture:", error);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to start lecture. Please try again later.",
      data: null,
    };
  }
};


export const joinLecture = async (lectureId, userId, token) => {
  try {
    const response = await db.post(
      `/lectures/join/${lectureId}`,
      { userId },
      {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        success: true,
        message: response.data.message || "joined Lecture successfully",
        data: response.data,
      };
    } catch (error) {
      console.error("Error occurred while joining lecture:", error);
  
      return {
        success: false,
        message: error.response?.data?.message || "Failed to join lecture. Please try again later.",
        data: null,
      };
    }
  };

export const getRoomToken = async (lectureId, token) => {
  try {
    const response = await db.post(
      `/lectures/startlecture/${lectureId}`, 
      {}, // Empty request body
      {
        headers: { Authorization: `Bearer ${token}` }, // Corrected header format
      }
    );

    return {
      success: true,
      message: response.data.message || "Lecture started successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error occurred while starting lecture:", error);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to start lecture. Please try again later.",
      data: null,
    };
  }
};