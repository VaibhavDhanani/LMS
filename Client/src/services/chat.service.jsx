import db from "@/apis/database";


export async function fetchMessages(token){
    const API_URL = import.meta.env.VITE_SERVER_URL;
    try {
        const response = await db.get(`${API_URL}/messages`,{
            headers: { authorization: `Bearer ${token}` },
          });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = response.data;
        return data;
      } catch (error) {
        console.error('Error fetching messages:', error);
      }

}