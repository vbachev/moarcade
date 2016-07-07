define([ 'jquery', 'games/vector' ], function ( $, Vector ) {

    var Controller = function ( config ) {

        var agents  = {};
        var idIndex = 0;
        var moves   = [];

        var settings = {
            stage : {
                width  : 600,
                height : 600
            },
            player : {
                size        : 30,
                speed       : 3,
                maxSpeed    : 6,
                bounceSpeed : 0.5,
                friction    : 0.2,
                spawnTime   : 3000,
                health      : 3,
            },
            weapon : {
                size     : 40,
                distance : 10,
                lifetime : 200,
                color    : '#666'
            },
            corpse : {
                size     : 25,
                color    : '#310',
                lifetime : 10000
            }
        };
        $.extend( true, settings, config );

        var directions = {
            up    : new Vector( 0, -1 ),
            right : new Vector( 1, 0 ),
            down  : new Vector( 0, 1 ),
            left  : new Vector( -1, 0 )
        };

        function getRandomPosition () {
            var x = Math.floor( Math.random() * ( settings.stage.width ));
            var y = Math.floor( Math.random() * ( settings.stage.height ));
            return new Vector( x, y );
        }

        function getRandomColor () {
            return 'hsl(' + (Math.floor(Math.random()*18)*20) + ',100%,30%)';
        }

        function applyForce ( agent, direction, speed ) {
            speed = speed || settings.player.speed;
            agent.acceleration.mult(0);

            if( directions[ direction ] ){
                var directionVector = directions[ direction ];
                agent.direction = directionVector.clone();
                agent.acceleration.add( directionVector.clone().mult( speed ));
            }
        }

        function moveAgents ( dt ) {
            for( id in agents ){
                var agent = agents[id];

                if( agent.type == 'weapon' ){
                    agent.lifetime -= dt;
                    var parent = agents[ agent.parent ];
                    if( parent && agent.lifetime > 0 ){
                        agent.position = parent.position.clone().add( parent.direction.clone().mult( settings.weapon.distance ));
                    } else {
                        destroyAgent( agent.id );
                    }
                } else if( agent.type == 'corpse' ){
                    agent.lifetime -= dt;
                    if( agent.lifetime < 0 ){
                        destroyAgent( agent.id );
                    }
                } else if( agent.type == 'player' ){
                    detectCollision( agent );

                    // apply acceleration
                    agent.velocity.add( agent.acceleration ).limit( settings[ agent.type ].maxSpeed );
                    // apply friction
                    agent.velocity.add( agent.velocity.clone().mirror().limit( settings.player.friction ));
                    // apply velocity to position
                    agent.position.add( agent.velocity );
                    agent.acceleration.mult(0);
                }
            }
        }

        function detectCollision ( agent ) {
            if( agent.type !== 'player' ) return;

            if( agent.position.x < 0 ){
                applyForce( agent, 'right', settings.player.bounceSpeed );
            } else if( agent.position.x > settings.stage.width ){
                applyForce( agent, 'left', settings.player.bounceSpeed );
            } else if( agent.position.y < 0 ){
                applyForce( agent, 'down', settings.player.bounceSpeed );
            } else if( agent.position.y > settings.stage.height ){
                applyForce( agent, 'up', settings.player.bounceSpeed );
            }

            for( id in agents ){

                // skip self
                if( id == agent.id ) continue;

                otherAgent = agents[id];
                var proximity = agent.position.clone().sub( otherAgent.position );
                var minDistance = ( agent.size + otherAgent.size )/2;
                if( proximity.mag() < minDistance ){
                    // collision!
                    if( otherAgent.type == 'weapon' ){
                        if( otherAgent.parent !== agent.id && agent.lastHitId !== otherAgent.id ){
                            // receive hit
                            agent.acceleration = proximity;
                            agent.health--;
                            agent.lastHitId = otherAgent.id;
                            if( agent.health <= 0 ){
                                killPlayer( agent.id );
                                agents[ otherAgent.parent ].score++;
                                app.trigger('player_scores', {
                                    id : otherAgent.parent,
                                    score : agents[ otherAgent.parent ].score
                                });
                            }
                        }
                    } else {
                        // bounce in the opposite direction
                        agent.acceleration = proximity.limit( settings.player.bounceSpeed );
                    }
                }
            }
        }

        function createWeapon ( agent ) {
            var weapon = {
                id       : 'weapon-' + (++idIndex),
                parent   : agent.id,
                type     : 'weapon',
                color    : settings.weapon.color,
                size     : settings.weapon.size,
                position : agent.position.clone(),
                lifetime : settings.weapon.lifetime
            }

            agents[ weapon.id ] = weapon;
        }

        function destroyAgent ( id ) {
            delete agents[ id ];
        }

        function killPlayer ( id ) {
            var agent = agents[ id ];
            var corpse = {
                id       : 'corpse-'+(++idIndex),
                type     : 'corpse',
                size     : settings.corpse.size,
                color    : settings.corpse.color,
                position : agent.position.clone(),
                lifetime : settings.corpse.lifetime
            };
            agents[ corpse.id ] = corpse;

            // clone the agent object and remove from the game
            var soul = $.extend( {}, agent, {
                health       : settings.player.health,
                position     : getRandomPosition(),
                velocity     : new Vector(),
                acceleration : new Vector()
            });
            delete agents[ id ];
            delete agent;


            // in time bring the player back to life
            setTimeout( function () {
                agents[ soul.id ] = soul;
            }, settings.player.spawnTime );
        }

        return {

            agents : agents,
            settings : settings,

            addPlayer : function ( data ) {
                if( !data || !data.id ){
                    return;
                }

                var newPlayer = {
                    id           : data.id,
                    type         : 'player',
                    name         : data.name,
                    score        : 0,
                    color        : data.color || getRandomColor(),
                    size         : data.size || settings.player.size,
                    position     : getRandomPosition(),
                    velocity     : new Vector(),
                    acceleration : new Vector(),
                    direction    : directions.down.clone(),
                    health       : settings.player.health
                };

                agents[ data.id ] = newPlayer;
            },

            removePlayer : function ( data ) {
                destroyAgent( data.id )
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
                createWeapon( agents[ data.id ]);
            },

            play : function ( dt ) {
                moves.forEach( function ( move ) {
                    if( move.id && agents[ move.id ] ){
                        var player = agents[ move.id ];
                        applyForce( player, move.message );
                    }
                });
                moves = [];

                moveAgents( dt );
            },

            getDTO : function(){
                return agents;
            }
        }
    };

    return Controller;
});