requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
    }
});

define(
    [ 'jquery', 'app/host', 'app/core', 'app/loop', 'app/arenaController', 'app/arenaView' ],
    // [ 'jquery', 'app/client', 'app/core', 'app/loop', 'app/arenaController', 'app/arenaView' ], // mocking
    function( $, Host, Core, Loop, Controller, View ){

    var stageConfig = {
        stage : {
            width : 600,
            height : 600
        }
    };

    window.app = {};

    app.core = new Core();
    app.on = app.core.on;
    app.off = app.core.off;
    app.trigger = app.core.trigger;

    app.host = new Host();
    app.loop = new Loop();
    app.controller = new Controller( stageConfig );
    app.view = new View( stageConfig );

    app.on( 'start', function(){
        app.host.initialize( function ( data ) {
            app.trigger( 'command', data );
        });

        app.view.initialize();

        app.loop.start( function ( dt ) {
            app.trigger( 'loop', dt );
        });
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
            case 'shake':
                app.controller.addAction( data );
                break;
            case 'host_ready':
                app.view.setURL( data );
                break;
        }
    });

    app.on( 'loop', function ( dt ) {
        app.controller.play( dt );
        app.view.render( app.controller.getDTO() );
    });

    $(function(){
        app.trigger( 'start' );
    });

});