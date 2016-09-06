define([ 'socket.io', 'app/observer', 'app/player' ], function (io, Observer, Player) {
    
    var Host = function () {
        var observer = new Observer();
        var hostId = 0;
        var hostURL;
        var socket;
        var players = [];
        
        function initialize () {
            socket = io.connect('/');
            socket.on('welcome', onConnection);
            socket.on('command', onCommand);
            socket.on('player_joined', addPlayer);
            socket.on('player_left', removePlayer);

            observer.on('game_started', function (event) {
               socket.emit('game_started', event.data.key); 
            });
        }

        function onConnection (id) {
            hostId = id;
            hostURL = window.location.origin + '/join?host=' + hostId;

            socket.emit('host_ready');

            observer.trigger('connected', {
                id : hostId,
                url : hostURL
            });
        }

        function onCommand (data) {
            observer.trigger('command', data);
        }
        
        function addPlayer (data) {
            var newPlayer = new Player(data);
            players.push(newPlayer);
            observer.trigger('player_joined', newPlayer);

            if(app.game){
                socket.emit('game_started', app.game.key);
            }
        }

        function removePlayer (data) {
            var i, removedPlayer;
            for(i = 0; i < players.length; i++){
                if(players[i].id == data.id){
                    removedPlayer = players.splice(i, 1)[0];
                    break;
                }
            }
            if(removedPlayer){
                observer.trigger('player_left', removedPlayer);
            }
        }

        initialize();

        return {
            players : players,
            on : observer.on,
            off : observer.off,
            trigger : observer.trigger
        }
    }

    return Host;
});