var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set( 'port', (process.env.PORT || 5000));
app.use( express.static( __dirname + '/host' ));
app.use( '/join', express.static( __dirname + '/client' ));

var idIndex = 0;
var latestHostId = 0;

// start listening
http.listen( app.get('port'), function(){
	console.log('listening on *:'+app.get('port'));
});

// when a new socket is created
io.on( 'connection', function ( socket ) {
	var clientId = ++idIndex;
	var roomId = 0;

	// notify client of its ID
	socket.emit( 'welcome', clientId );
	console.log('connection: '+clientId);

	// create room when host is initialized
	socket.on('host_ready', function () {
		console.log('host creates room '+clientId);
		socket.join( clientId );
		latestHostId = clientId;
	});

	// join host room when client is initialized
	socket.on('player_ready', function( data ){
		data.id = clientId;

		roomId = data.room || latestHostId;
		socket.join( roomId );

		console.log('player connected: ' + data.id + ' ' + data.name);
		console.log('player joins room ' + roomId);

		socket.broadcast.to( roomId ).emit('player_joined', data);
	});

	// when a player is leaving
	socket.on('disconnect', function(){
		console.log('user disconnected: '+clientId);
		socket.broadcast.to( roomId ).emit('player_left', { id : clientId });
	});

	socket.on( 'command', function ( commandName ) {
		socket.broadcast.to( roomId ).emit( 'command', {
			message : commandName,
			id : clientId
		});
	});
});