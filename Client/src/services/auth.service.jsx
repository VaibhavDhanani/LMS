import db from "@/apis/database";

export const login = async (formData)=>{
        try {
          const response = await db.post('/auth/login',formData);
          return {
            success: true,
            message: response.data.message ,
            data: response.data.data,
          };
        } catch (error) {
          console.error("Error occurred while loging:", error);
          return {
            success: false,
            message: error.response?.data?.message || "unable to login",
            data: null,
          };
        }
      };

export const register = async (formData)=>{
    try {
        const response = await db.post('/auth/register',formData);
        return {
            success: true,
            message: response.data.message ,
            data: response.data.data,
          };
        } catch (error) {
          console.error("Error occurred while registering:", error);
          return {
            success: false,
            message: error.response?.data?.message || "unable to register",
            data: null,
          };
        }
      };

export const googleSignUp = async (token,role) => {
  try {
    const response = await db.post('/auth/google-signup', { token, role });
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error occurred while signing up with Google:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to sign up with Google",
      data: null,
    };
  }
};

export const googleLogin = async (token) => {
  try {
    const response = await db.post('/auth/google-login', { token });
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error occurred while loging in with Google:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to sign in with Google",
      data: null,
    };
  }
};