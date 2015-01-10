define([ 'jquery' ], function ( $ ) {
    'use strict';

    var Controller = function ( config ) {

        var agents = {};
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

        function positionIsAllowed ( pos ) {
            return pos.x >= 0 && pos.x < settings.grid.width && pos.y >= 0 && pos.y < settings.grid.height;
        }

        function positionIsTaken ( pos ) {

            for( var id in agents ){
                var agent = agents[id];
                if( agent.position.x == pos.x && agent.position.y == pos.y ){
                    return id;
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

            var occupantId = positionIsTaken( newPosition );
            if( occupantId != -1 && agents[ occupantId ] ){
                // if( agents[ occupantId ].type == 'crate' && !pushed ){
                    var occupantMoveResult = moveAgent( agents[ occupantId ], direction, true );
                    if( !occupantMoveResult ){
                        return false;
                    }
                // } else {
                //     return false;
                // }
            }

            agent.position = newPosition;

            return true;
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
                    position : getRandomPosition()
                };

                newPlayer.color = data.color || '#' + Math.floor(Math.random()*4096).toString(16);

                agents[ data.id ] = newPlayer;
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

            playMoves : function(){
                moves.forEach( function ( move ) {
                    if( move.id && agents[ move.id ] ){
                        var player = agents[ move.id ];
                        moveAgent( agents[ move.id ], move.message );
                    }
                });
                moves = [];
            },

            getDTOs : function(){
                return agents;
            }
        }
    };

    return Controller;
});