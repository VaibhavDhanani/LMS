import db from "@/apis/database";

const API_URL = import.meta.env.VITE_SERVER_URL;

// console.log(API_URL)
const token = localStorage.getItem("authToken")

export async function fetchMessages() {
  try {
    const response = await db.get(`${API_URL}/messages`,{
      headers: { authorization: `Bearer ${token}`}
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}


export async function sendMessage(message) {
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