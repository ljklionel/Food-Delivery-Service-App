
const axios = require('axios');

const myAxios = axios.create({
    baseURL: 'http://127.0.0.1:5000/',
    timeout: 1000,
    headers: {'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Credentials': 'true',
      'crossdomain': 'true', 
      'crossorigin': 'true'},
    withCredentials: true
  });

  
export default myAxios;