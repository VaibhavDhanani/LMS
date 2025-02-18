import db from "@/apis/database"

export const getCourse = async (courseId,token)=>{
  try{
    const response = await db.get(`/courses/${courseId}`,{
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data.data;
  }catch (error) {
    console.error("Error fetching courses:", error);
    console.log(error);
  }
};

export const getAllCourse = async (token) => {
  try {
    const response = await db.get(`/courses`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data.data; // Return the data if the request is successful
  } catch (error) {
    console.error("Error fetching courses:", error);
    return []; // Return an empty array or suitable fallback value in case of an error
  }
};


export const getInstructorCourse = async (instructorId, token) => {
    try {
      const response = await db.get(`/courses/users/${instructorId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error; // Re-throw the error for further handling
    }
  };

export const getStudentEnrolledCourses =async (userId,token) => {
  try{
    const response = await db.get(`/courses/enrolled/${userId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data.data;
  }
  catch (error) {
    console.error("Error fetching enrolled courses:", error);
    throw error; // Re-throw the error for further handling
  }
};
  
export const getCourseById = async  (courseId,token) => {
  try {
    const response = await db.get(`/courses/${courseId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error; // Re-throw the error for further handling
  }
};

export const updateCourse = async (id,course,token) => {
  try {
    const response = await db.put(`/courses/${id}`,course, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error; // Re-throw the error for further handling
  } 
}