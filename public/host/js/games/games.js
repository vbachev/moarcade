define(['app/dashboard'], function (Dashboard) {

    var templates = {
        gamesList : '<h2 class="games-title">Choose what to play:</h2><ul class="games-list"/>',
        listItem : '<li data-key="{{key}}">{{name}}</li>'
    };

    var games = [
        {
            key : 'planes',
            name : 'Planes'
        },
        {
            key : 'snake',
            name : 'Snakes'
        },
        {
            key : 'arena',
            name : 'Arena'
        }
    ];

    function template (tpl, params) {
        var template = templates[tpl];
        for(key in params){
            template = template.replace('{{' + key + '}}', params[key]);
        }
        return template;
    }

    function loadGame ( key ) {
        $('.gameboard').empty();
        require(['games/' + key + '/' + key], function(gameInstance){
            // the game script is now loaded and executed
            app.trigger('game_started', {
                key : key,
                instance :gameInstance
            });
        });
    }

    return {
        initialize : function () {
            var gameboard = $('.gameboard');
            gameboard.append(templates.gamesList);
            
            var list = gameboard.find('.games-list');
            for(var i = 0; i < games.length; i++){
                list.append(template('listItem', games[i]));
            }

            list.on('click', 'li', function(){
                loadGame($(this).data('key'));
                Dashboard.toggleFullScreen();
            });
        }
    }
});