define(function(){

    var templates = {
        gamesList : '<h2 class="games-title">Choose what to play:</h2><ul class="games-list"/>',
        listItem : '<li data-key="{{key}}">{{name}}</li>'
    };

    var games = [
        {
            key : 'snake',
            name : 'Snake Classic'
        },
        {
            key : 'arena',
            name : 'Battle Arena'
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
        require(['game/' + key], function(gameInstance){
            app.trigger('game_started', gameInstance);
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
            });
        }
    }
});