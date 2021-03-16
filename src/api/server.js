const http = require('http'); //native NodeJs module to work with protocol http
require('dotenv').config(); //Use .env files
const app = require('./app');
const port = process.env.PORT; 
const server = http.createServer(app); //create server to work in port defined in .env file
server.listen(port);
console.log('Server working at port '+ port)