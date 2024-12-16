import axios from 'axios';
// const url = import .meta.env.VITE_SERVER_URL;
const db = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default db;
