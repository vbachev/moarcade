var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));
app.use( express.static( __dirname + '/host' ));
app.use( '/join', express.static( __dirname + '/client' ));

var idIndex = 0;

io.on('connection', function(socket){
	var clientId = ++idIndex;
	var roomId = 0;
	console.log('connection: '+clientId);

	socket.emit( 'welcome', clientId );

	socket.on('host_ready', function () {
		console.log('host creates room '+clientId);
		socket.join( clientId );
	});

	socket.on('connected', function( data ){
		console.log('a user connected: '+data.id+data.name);

		roomId = data.room;
		console.log('client joins room '+roomId);
		socket.join( roomId );

		socket.broadcast.to( roomId ).emit('player_joined', data);
	});

	socket.on('disconnect', function(){
		console.log('user disconnected: '+clientId);
		socket.broadcast.to( roomId ).emit('player_left', { id : clientId });
	});

	socket.on( 'up', function ( id ) {
		socket.broadcast.to( roomId ).emit( 'command', {
			message : 'up',
			id : id
		});
	});

	socket.on( 'right', function ( id ) {
		socket.broadcast.to( roomId ).emit( 'command', {
			message : 'right',
			id : id
		});
	});

	socket.on( 'down', function ( id ) {
		socket.broadcast.to( roomId ).emit( 'command', {
			message : 'down',
			id : id
		});
	});

	socket.on( 'left', function ( id ) {
		socket.broadcast.to( roomId ).emit( 'command', {
			message : 'left',
			id : id
		});
	});

});

http.listen(app.get('port'), function(){
	console.log('listening on *:'+app.get('port'));
});