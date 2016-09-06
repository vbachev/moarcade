var io = require('socket.io');
var socketApp;
var idIndex = 0;
var latestHostId = 0;

// when a new socket is created (when a client connects)
// socket - represents the connection to the client
function onConnection (socket) {
    var clientId = ++idIndex;
    var hostId = 0; // store the ID of a player client's host

    // notify client of their ID
    socket.emit('welcome', clientId);
    console.log('connection: ' + clientId);

    // when a client is leaving
    socket.on('disconnect', function(){
        console.log('user disconnected: ' + clientId);
        socket.broadcast.to(hostId).emit('player_left', { id : clientId });
        // @TODO: notify players on host disconnect
    });

    // create a room/channel when a host is initialized
    socket.on('host_ready', function () {
        console.log('host creates room ' + clientId);
        socket.join(clientId);
        latestHostId = clientId;
    });

    // notify room/channel subscibers (players) that the game has started
    socket.on('game_started', function (gameKey) {
        socket.to(clientId).emit('game_started', gameKey);
    });

    // join the host room when a client is initialized
    socket.on('player_ready', function(data){
        data.id = clientId;

        hostId = data.room || latestHostId;
        socket.join(hostId);

        console.log('player connected: ' + data.id + ' ' + data.name);
        console.log('player joins room ' + hostId);

        socket.broadcast.to(hostId).emit('player_joined', data);
    });

    // transport commands from any player clients to their host client
    socket.on('command', function (commandName, data) {
        socket.broadcast.to(hostId).emit('command', {
            message : commandName,
            id : clientId,
            data : data
        });
    });
}

exports.start = function (httpServer) { 
    socketApp = io(httpServer);
    socketApp.on('connection', onConnection);
};;