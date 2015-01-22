define([ 'jquery', 'app/vector' ], function ( $, Vector ) {

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
                size        : 20,
                speed       : 3,
                maxSpeed    : 4,
                bounceSpeed : 0.5,
                friction    : 0.15,
                spawnTime   : 3000,
                health      : 3,
            },
            weapon : {

                // spear
                // size     : 10,
                // distance : 25,

                // flail
                // size     : 30,
                // distance : 5,

                // sword
                size     : 20,
                distance : 15,

                lifetime : 200,
                color    : '#666'
            },
            corpse : {
                size  : 15,
                color : '#310',
                blur  : 0
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
                        destroyWeapon( agent.id );
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

        function destroyWeapon ( id ) {
            delete agents[ id ];
        }

        function killPlayer ( id ) {
            var agent = agents[ id ];
            var corpse = {
                id       : 'corpse-'+(++idIndex),
                size     : settings.corpse.size,
                color    : settings.corpse.color,
                blur     : settings.corpse.blur,
                position : agent.position.clone()
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