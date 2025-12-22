import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api', // သင့် Backend Port နဲ့ တူပါစေ
});

export default API;