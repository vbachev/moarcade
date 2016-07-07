define(['games/chase/chaseController', 'games/chase/chaseView'], function (ChaseController, ChaseView) {
    var game = {
        settings : {
            player : {
                maxSpeed : 2,
                steeringStep : 20,
                cornering : 0.05,
                respawnTime : 2000
            },
            explosion : {
                duration : 100,
                friction : 0.01
            }
        }
    };
    game.view = new ChaseView(game.settings);
    game.settings.view = game.view.getDimensions();
    game.controller = new ChaseController(game.settings);

    for(var i = 0; i < app.players.length; i++){
        game.controller.addPlayer(app.players[i]);
    }

    app.on('player_joined', function (event) {
        game.controller.addPlayer(event.data);
    });

    app.on('player_left', function (event) {
        game.controller.removePlayer(event.data);
    });

    app.on('command', function (event) {
        game.controller.onCommand(event.data);
    });

    app.on('loop', function (event) {
        game.controller.onLoop(event.data);
        game.view.onLoop({
            dt : event.data,
            viewModel : game.controller.getViewModel()
        });
    });

    return game;
});