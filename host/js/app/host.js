define([ 'socket.io' ], function ( io ) {
    'use strict';

    var Host = function ( config ){

        var hostId = 0;
        var hostURL;
        var socket;

        return {
            initialize : function ( callback ) {
                socket = io.connect('/');

                socket.on( 'welcome', function ( hostId ) {
                    hostURL = window.location.href + 'join?host=' + hostId;

                    socket.emit('host_ready');
                    callback({
                        message : 'host_ready',
                        id : hostId,
                        url : hostURL
                    });
                });

                socket.on( 'player_joined', function ( data ) {
                    data.message = 'player_joined';
                    callback(data);
                });

                socket.on( 'player_left', function ( data ) {
                    data.message = 'player_left';
                    callback(data);
                });

                socket.on( 'command', function ( data ) {
                    callback(data);
                });
            }
        }

    };

    return Host;
});