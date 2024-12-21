import db from "@/apis/database"

export const getCourse = async (courseId,token)=>{
  try{
    const response = await db.get(`/courses/${courseId}`,{
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }catch (error) {
    console.error("Error fetching courses:", error);
    console.log(error);
  }
};

export const getAllCourse = async (token) => {
  try {
    const response = await db.get(`/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return the data if the request is successful
  } catch (error) {
    console.error("Error fetching courses:", error);
    return []; // Return an empty array or suitable fallback value in case of an error
  }
};


export const getInstructorCourse = async (instructorId, token) => {
    try {
      const response = await db.get(`/courses/users/${instructorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error; // Re-throw the error for further handling
    }
  };
  
export const getCourseById = async  (courseId,token) => {
  try {
    const response = await db.get(`/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error; // Re-throw the error for further handling
  }
};

export const updateCourse = async (course,token) => {
  try {
    const response = await db.put(`/courses`,course, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error; // Re-throw the error for further handling
  } 
}