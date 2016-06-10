define(['game/snake/controller', 'game/snake/view'], function (Controller, View) {
    
    var game = {
        stageConfig : {
            grid : {
                width : 20,
                height : 20,
                cellSize : 20
            }
        }
    };

    game.controller = new Controller(game.stageConfig);
    game.view = new View(game.stageConfig);
    game.view.initialize();

    for(var i = 0; i < app.players.length; i++){
        game.controller.addPlayer(app.players[i]);
    }

    app.on('command', function (event) {
        switch(event.data.message){
            case 'up':
            case 'right':
            case 'down':
            case 'left':
                game.controller.addMove(event.data);
                break;
        }
    });

    app.on('player_joined', function (event) {
        game.controller.addPlayer(event.data);
    });

    app.on('player_left', function (event) {
        game.controller.removePlayer(event.data);
    });

    app.on('loop', function () {
        game.controller.play();
        game.view.render(game.controller.getDTO());
    });

    return game;

});