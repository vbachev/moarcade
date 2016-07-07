define([ 'app/keyboard', 'app/player' ], function ( Keyboard, Player ) {
    
    function MockPlayer () {

        var mockPlayers = [42, 43]; 
        
        // create mock players and join them to the game
        for(i in mockPlayers){
            var newPlayer = new Player({
                id : mockPlayers[i],
                name : 'mock #' + mockPlayers[i]
            });
            app.players.push(newPlayer);
            app.trigger('player_joined', newPlayer);
        }

        // listen for keys and trigger mock commands
        var keyboard = new Keyboard();
        var p1Keys = ['up','right','down','left'];
        var p2Keys = ['w','d','s','a'];
        keyboard.addHandler( function( keyName ){
            var commandId = 0;

            if( p1Keys.indexOf( keyName ) != -1 ){
                commandId = mockPlayers[0];
            }
            else if( p2Keys.indexOf( keyName ) != -1 ){
                commandId = mockPlayers[1];
                keyName = p1Keys[ p2Keys.indexOf( keyName )];
            }

            app.trigger('command', {
                message : keyName,
                id : commandId
            });
        });
    }

    return MockPlayer;
});