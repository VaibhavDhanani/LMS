import db from '../apis/database.js'

export const createDraft = async (draft,token)=>{
    const response = await db.post('/drafts',draft, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export const getDrafts = async (userId, token) => {
  try {
    if (!token) {
      console.log('Token is null or undefined');
      return []; 
    }
    const response = await db.get(`/drafts/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching drafts:", error);
  }
};


export const getDraftById = async (id,token)=>{
    const response = await db.get(`/drafts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export const updateDraft = async (id,draft)=>{
    const response = await db.put(`/drafts/${id}`,draft);
    return response.data;
}

export const publishDraft = async (id, draft) => {
    try {
      const response = await db.post(`/publishdrafts/${id}`, draft);
      
      // Check if the response contains an error
      if (response.error) {
        console.error("Error while publishing draft:", response.error);
        throw new Error(response.error); // Throw error to be caught below
      }
  
      return response.data;
    } catch (error) {
      console.error("Error publishing draft:", error.message);
      throw error; // Re-throw the error after logging
    }
  };
  

export const deleteDraft = async (id)=>{
    const response = await db.delete(`/drafts/${id}`);
    return response.data;
}



