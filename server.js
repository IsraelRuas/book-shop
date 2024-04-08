//Import from nodeJS
const http = require ('http');

//Import app
const app = require('./app');

const port = process.env.PORT || 3000;

//Pass a listener 
//Pass app to create a server
const server = http.createServer(app);

//It starts the server and receive the prot as an argument
server.listen(port);
