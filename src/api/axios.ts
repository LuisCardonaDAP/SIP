import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // URL de Laravel
    withCredentials: true, // Permite el envío de cookies
    headers: {
        'Accept': 'application/json',
    }
});

export default api;