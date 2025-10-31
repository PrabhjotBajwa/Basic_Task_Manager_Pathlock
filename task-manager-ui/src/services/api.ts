import axios from 'axios';

// This is the base URL of your C# backend
const API_URL = 'http://localhost:5146/api'; 
// Note: Your port might be different. Check your backend's launchSettings.json

const api = axios.create({
  baseURL: API_URL,
});

export default api;