define([ 'jquery' ], function ( $ ) {

    var Controller = function ( config ) {

        var agents = {};
        var idIndex= 0;
        var moves = [];

        var settings = {
            grid : {
                width : 100,
                height : 100
            },
            player : {
                speed : 1,
                startPosition : {
                    x : 2,
                    y : 2
                }
            }
        };

        $.extend( true, settings, config );

        function getRandomPosition () {
            var position = { x:0, y:0 };

            position.x = Math.floor( Math.random() * ( settings.grid.width ));
            position.y = Math.floor( Math.random() * ( settings.grid.height ));

            if( positionIsTaken( position ) == -1 ){
                return position;
            } else {
                return getRandomPosition();
            }
        }

        function getRandomColor () {
            return 'hsl(' + (Math.floor(Math.random()*18)*20) + ',100%,30%)';
        }

        function positionIsAllowed ( pos ) {
            return pos.x >= 0 && pos.x < settings.grid.width && pos.y >= 0 && pos.y < settings.grid.height;
        }

        function positionIsTaken ( pos ) {

            for( var id in agents ){
                var agent = agents[id];
                if( agent.position.x == pos.x && agent.position.y == pos.y ){
                    return id;
                }
                if( agent.tail && agent.tail.length ){
                    for( var i = 0, l = agent.tail.length; i < l; i++ ){
                        if( agent.tail[i].x == pos.x && agent.tail[i].y == pos.y ){
                            return id;
                        }
                    }
                }
            }
            return -1;
        }

        function moveAgent ( agent, direction, pushed ) {

            var newPosition = {
                x : agent.position.x,
                y : agent.position.y
            };

            switch ( direction ){
                case 'up':
                    newPosition.y -= settings.player.speed;
                break;
                case 'right':
                    newPosition.x += settings.player.speed;
                break;
                case 'down':
                    newPosition.y += settings.player.speed;
                break;
                case 'left':
                    newPosition.x -= settings.player.speed;
                break;
            }

            if( !positionIsAllowed( newPosition ) ){
                return false;
            }

            var eating = false;
            var occupantId = positionIsTaken( newPosition );
            if( occupantId != -1 && agents[ occupantId ] ){
                if( agents[ occupantId ].type == 'crate' && !pushed ){
                    // var occupantMoveResult = moveAgent( agents[ occupantId ], direction, true );
                    // if( !occupantMoveResult ){
                    //     return false;
                    // }
                    eating = true;
                    delete agents[occupantId];
                    addCrate();
                } else {
                    return false;
                }
            }

            agent.tail.unshift( agent.position );
            if( !eating ){
                agent.tail.pop();
            }

            agent.position = newPosition;

            return true;
        }

        function addCrate (){
            var crateId = 'crate'+(++idIndex);
            agents[ crateId ] = {
                id : crateId,
                type : 'crate',
                color : '#333',
                position : getRandomPosition()
            };
        }

        if( settings.randomCrates ){
            for( var i =0, l = settings.randomCrates; i < l; i++ ){
                addCrate();
            }
        }

        return {

            agents : agents,

            addPlayer : function ( data ) {
                if( !data || !data.id ){
                    return;
                }

                var newPlayer = {
                    id : data.id,
                    type : 'player',
                    name : data.name,
                    color : data.color || getRandomColor(),
                    position : getRandomPosition(),
                    tail : []
                };

                agents[ data.id ] = newPlayer;

                addCrate();
            },

            removePlayer : function ( data ) {
                if( !data || !data.id || !agents[data.id] ){
                    return;
                }

                delete agents[data.id];
            },

            addMove : function ( data ) {
                if( !data ){
                    return;
                }

                moves.push( data );
            },

            addAction : function ( data ) {
                if( !data ){
                    return;
                }

                agents[ data.id ].color = getRandomColor();
            },

            play : function(){
                moves.forEach( function ( move ) {
                    if( move.id && agents[ move.id ] ){
                        var player = agents[ move.id ];
                        moveAgent( agents[ move.id ], move.message );
                    }
                });
                moves = [];
            },

            getDTO : function(){
                return agents;
            }
        }
    };

    return Controller;
});