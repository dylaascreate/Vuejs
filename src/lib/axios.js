import axios from 'axios';

// const api = axios.create({
//     baseURL: 'http://localhost:8000',
//     withCredentials: true, // REQUIRED: Sends cookies with requests
//     headers: {
//         'X-Requested-With': 'XMLHttpRequest',
//         'Accept': 'application/json',
//     }
// });

axios.defaults.withCredentials = true; // <--- CRITICAL
axios.defaults.baseURL = 'http://localhost:8000';

export default api;