import db from "@/apis/database";

export const login = async (formData)=>{
        try {
          const response = await db.post('/auth/login',formData);
          return response.data;
        }catch (e) {
            console.error(e);
        }
};

export const register = async (formData)=>{
    try {
        const response = await db.post('/auth/register',formData);
        return response.data;
    }catch (e) {
        console.error(e);
    }
}