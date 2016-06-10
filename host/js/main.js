requirejs.config({
    baseUrl : 'js/lib',
    paths : {
        app : '../app',
        game : '../game'
    }
});

require([ 'jquery', 'app/host', 'app/loop', 'app/dashboard', 'game/main' ], function($, Host, Loop, Dashboard, GameManager){
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
        GameManager.initialize();
    });

    app.on('game_started', function (event) {
        app.game = event.data;
        Loop.start(function (dt) {
            app.trigger('loop', dt);
        });
    });

    app.on('game_ended', function (event) {
        Loop.stop();
    });

});