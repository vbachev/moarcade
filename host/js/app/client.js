define([ 'app/keyboard' ], function ( Keyboard ) {
    'use strict';

    var Client = function ( config ) {

        return {
            initialize : function ( callback ) {
                setTimeout( function(){

                    callback({
                        message : 'host_ready',
                        id : 1,
                        url : 'mock connection'
                    });

                    callback({
                        message : 'player_joined',
                        id : 42,
                        name : 'vasil'
                    });

                    callback({
                        message : 'player_joined',
                        id : 41,
                        name : 'fanka',
                        color: 'green'
                    });

                    var keyboard = new Keyboard();
                    var p1Keys = ['up','right','down','left'];
                    var p2Keys = ['w','d','s','a'];
                    keyboard.addHandler( function( keyName ){
                        var commandId = 0;

                        if( p1Keys.indexOf( keyName ) != -1 ){
                            commandId = 42;
                        }
                        else if( p2Keys.indexOf( keyName ) != -1 ){
                            commandId = 41;
                            keyName = p1Keys[ p2Keys.indexOf( keyName )];
                        }

                        callback({
                            message : keyName,
                            id : commandId
                        });
                    });

                }, 1000 );
            }
        }
    };

    return Client;
});