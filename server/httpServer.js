var http = require('http');
var express = require('express');

var expressApp = express();
expressApp.set('port', (process.env.PORT || 5000));

// set routing
expressApp.use(express.static('public/host'));
expressApp.use('/join', express.static('public/client'));

// start listening
var httpServer = http.Server(expressApp);
httpServer.listen(expressApp.get('port'), function(){
	console.log('Listening on *:' + expressApp.get('port'));
});

module.exports = httpServer;