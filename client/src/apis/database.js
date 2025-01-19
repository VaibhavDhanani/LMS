import axios from 'axios';
const url = import.meta.env.VITE_SERVER_URL;

const db = axios.create({
  baseURL: `${url}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default db;
