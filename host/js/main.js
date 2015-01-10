requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
    }
});

define([ 'jquery', 'socket.io', 'app/core', 'app/loop', 'app/client', 'app/controller', 'app/view' ], function( $, io, Core, Loop, Client, Controller, View ){
    'use strict';

    var stageConfig = {
        grid : {
            width : 20,
            height : 20,
            cellSize : 20
        }
    };

    window.app = {};

    app.core = new Core();
    app.on = app.core.on;
    app.off = app.core.off;
    app.trigger = app.core.trigger;

    app.loop = new Loop();
    app.controller = new Controller( stageConfig );
    app.view = new View( stageConfig );

    app.on( 'start', function(){
        app.view.initialize();

        app.loop.start( function(){
            app.trigger( 'loop' );
        });

        // MOCKING
        // app.client = new Client();
        // app.client.initialize();
    });

    app.on( 'stop', function(){
        app.loop.stop();
    });

    app.on( 'command', function ( data ) {
        switch( data.message ){
            case 'player_joined':
                app.controller.addPlayer( data );
                app.view.addPlayer( data );
                break;
            case 'player_left':
                app.controller.removePlayer( data );
                app.view.removePlayer( data );
                break;
            case 'up':
            case 'right':
            case 'down':
            case 'left':
                app.controller.addMove( data );
                break;
        }
    });

    app.on( 'loop', function () {
        app.controller.playMoves();
        app.view.render( app.controller.getDTOs());
    });

    $(function(){
        app.trigger( 'start' );
    });

    app.io = {};
    app.io.socket = io.connect('/');

    app.io.socket.on( 'welcome', function ( hostId ) {
        var joinUrl = window.location.href+'join?host='+hostId;
        $('.joinMessage').append('Join game <a href="'+joinUrl+'" target="_blank">here</a> or at '+joinUrl );
        app.io.socket.emit('host_ready');
    });

    app.io.socket.on( 'player_joined', function ( data ) {
        data.message = 'player_joined';
        app.trigger( 'command', data );
    });

    app.io.socket.on( 'player_left', function ( data ) {
        data.message = 'player_left';
        app.trigger( 'command', data );
    });

    app.io.socket.on( 'command', function ( data ) {
        app.trigger( 'command', data );
    });

});