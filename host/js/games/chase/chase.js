define(['games/chase/chaseController', 'games/chase/chaseView'], function (ChaseController, ChaseView) {
    var game = {
        settings : {
            player : {
                maxSpeed : 3,
                steeringStep : 20,
                cornering : 0.05,
                respawnTime : 2000,
                reloadTime : 1500,
                size: 40
            },
            debris : {
                duration : 100,
                friction : 0.03,
                size: 65
            },
            rocket : {
                maxSpeed : 6,
                duration : 100,
                acceleration : .5,
                seekRange : 100,
                cornering : 0.1,
                size : 10
            },
            explosion : {
                duration : 50,
                size : 33
            }
        }
    };

    function start () {
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
    }

    game.view = new ChaseView(game.settings);
    game.settings.view = game.view.getDimensions();
    game.controller = new ChaseController(game.settings);

    // start when the view is fully loaded
    game.view.onReady(start);

    return game;
});