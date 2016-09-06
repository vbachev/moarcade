var httpServer = require('./server/httpServer');
var socketApp = require('./server/socketApp');

// start the socket.io server
socketApp.start(httpServer);