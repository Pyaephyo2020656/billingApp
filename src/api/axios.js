import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api', 
});

// const API = axios.create({
//   baseURL: '/api' 
// });

export default API;