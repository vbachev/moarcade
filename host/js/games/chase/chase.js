define(['games/chase/chaseController', 'games/chase/chaseView'], function (ChaseController, ChaseView) {
    var game = {
        settings : {
            player : {
                maxSpeed : 150, // in px/s
                steeringStep : 20, // in deg
                cornering : 8, // in px/s^2?
                respawnTime : 2000, // in ms
                reloadTime : 1000, // in ms
                size: 40 // in px
            },
            debris : {
                duration : 1, // in s
                friction : 2, // in px/s^2?
                size: 65 // in px
            },
            rocket : {
                startSpeed : 200, // in px/s
                maxSpeed : 400, // in px/s
                duration : 2, // in s
                idleTime : 0.5, // in s
                acceleration : 5, // in px/s^2?
                seekRange : 200, // in px
                cornering : 7, // in px/s^2?
                size : 10 // in px
            },
            explosion : {
                duration : 1, // in s
                size : 33 // in px
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