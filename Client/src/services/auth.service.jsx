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