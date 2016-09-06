requirejs.config({
    baseUrl : 'js/lib',
    paths : {
        app : '../app',
        games : '../games'
    }
});

require([ 'jquery', 'app/host', 'app/loop', 'app/dashboard', 'app/mock', 'games/games' ], function(_$, Host, Loop, Dashboard, Mock, GamesManager){
    window.app = new Host();

    app.on('player_joined', function (event) {
        Dashboard.addPlayer(event.data);
        Dashboard.updateScore(event.data);
    });

    app.on('player_scores', function (event) {
        Dashboard.updateScore(event.data);
    });
    
    app.on('player_left', function (event) {
        Dashboard.removePlayer(event.data);
    });

    app.on('connected', function (event) {
        Dashboard.setURL(event.data);
        GamesManager.initialize();
        
        // mock players
        new Mock();
    });

    app.on('game_started', function (event) {
        app.game = event.data.instance;
        app.game.key = event.data.key;
        Loop.start(function (dt) {
            app.trigger('loop', dt);
        });
    });

    app.on('game_ended', function (event) {
        Loop.stop();
    });
});