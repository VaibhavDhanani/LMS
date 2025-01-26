import db from '../apis/database.js'

export const createDraft = async (draft,token)=>{
    const response = await db.post('/drafts',draft, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data.data;
}

export const getDrafts = async (userId, token) => {
  try {
    if (!token) {
      console.log('Token is null or undefined');
      return []; 
    }
    const response = await db.get(`/drafts/users/${userId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching drafts:", error);
  }
};


export const getDraftById = async (id,token)=>{
    const response = await db.get(`/drafts/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data.data;
}

export const updateDraft = async (id,draft,token)=>{
    const response = await db.put(`/drafts/${id}`,draft, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data.data;
}

export const publishDraft = async (id, draft,token) => {
    try {
      const response = await db.post(`/publishdrafts/${id}`, draft, {
        headers: { authorization: `Bearer ${token}` },
      });
      
      if (response.error) {
        console.error("Error while publishing draft:", response);
        throw new Error(response.error); // Throw error to be caught below
      }  
      return response.data;
    } catch (error) {
      console.error("Error publishing draft:", error.response.data.message);
      throw error.response.data; // Re-throw the error after logging
    }
  };
  

export const deleteDraft = async (id,token)=>{
    const response = await db.delete(`/drafts/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data;
}



