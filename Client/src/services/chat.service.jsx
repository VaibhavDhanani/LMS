import db from "@/apis/database";
import { useAuth } from "@/context/AuthContext";
const API_URL = import.meta.env.VITE_SERVER_URL;

// const {token }= useAuth();
// console.log(API_URL)

export async function fetchMessages(token) {
  try {
    const response = await db.get(`/messages`,{
      headers: { authorization: `Bearer ${token}` },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}


export async function sendMessage(message,token) {
  try {
    const response = await db.post(`${API_URL}/messages`, 
      { message },
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}