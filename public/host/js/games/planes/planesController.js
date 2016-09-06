define(['games/vector'], function (Vector) {

    function PlanesController (config) {
        var settings = $.extend(true, {}, config);
        var idIndex = 0;

        var actors = {
            player : {},
            bullet : {},
            rocket : {},
            explosion : {},
            debris : {}
        };

        var behaviorSets = {
            player : [
                'shoot',
                'steer',
                'move',
                'collide'
            ],
            bullet : [
                'move',
                'expire'
            ],
            rocket : [
                'seek',
                'move',
                'expire'
            ],
            explosion : [
                'move',
                'expire'
            ],
            debris : [
                'slowdown',
                'move',
                'expire'
            ]
        };

        var behaviors = {
            move : function (actor, dt) {
                // handle crossing map bounds
                if( actor.position.x < 0 ){
                    actor.position.x = settings.view.w;
                } else if( actor.position.x > settings.view.w ){
                    actor.position.x = 0;
                } else if( actor.position.y < 0 ){
                    actor.position.y = settings.view.h;
                } else if( actor.position.y > settings.view.h ){
                    actor.position.y = 0;
                }

                actor.velocity.add(actor.acceleration);
                if(settings[actor.type].maxSpeed){
                    actor.velocity.limit(settings[actor.type].maxSpeed);
                }
                actor.position.add(actor.velocity.clone().mult(dt));
                actor.acceleration.mult(0);
            },

            expire : function (actor, dt) {
                actor.duration -= dt;
                if(actor.duration < 0){
                    delete actors[actor.type][actor.id];
                }
            },

            shoot : function (actor, dt) {
                if(actor.shoot && actor.weaponLoaded){
                    createActor('rocket', actor);
                    // createActor('bullet', actor);

                    actor.weaponLoaded = false;
                    setTimeout((function(actor){
                        actor.weaponLoaded = true;
                    }).bind(this, actor), settings.player.reloadTime);
                }
                actor.shoot = false;
            },

            steer : function (actor, dt) {
                // steering
                // shift the heading to the left or right if steering occurs
                if(actor.steerAngle != 0){
                    var dodge = new Vector();
                    if(actor.steerAngle > 0){
                        // right perpendicular of velocity
                        dodge.x = actor.velocity.y;
                        dodge.y = actor.velocity.x * -1;
                    } else {
                        // left perpendicular of velocity
                        dodge.x = actor.velocity.y * -1;
                        dodge.y = actor.velocity.x;
                    }
                    dodge.normalize();
                    dodge.mult(Math.tan(Math.PI / 180 * Math.abs(actor.steerAngle)));
                    actor.heading.add(dodge.mult(dt * 10));
                    actor.heading.normalize();
                    
                    actor.steerAngle = 0;
                }
                
                actor.acceleration = actor.heading.clone();
                actor.acceleration.mult(settings.player.maxSpeed);
                actor.acceleration.sub(actor.velocity);
                actor.acceleration.limit(settings.player.cornering);
            },

            collide : function (actor, dt) {
                var collisionTypes = ['player', 'rocket', 'bullet'];
                for(var type in collisionTypes){
                    for(var id in actors[collisionTypes[type]]){
                        var otherActor = actors[collisionTypes[type]][id];
                     
                        // skip self
                        if(id == actor.id){
                            continue;
                        }

                        // dont collide with parent
                        if(otherActor.parent.id == actor.id){
                            continue;
                        }

                        var proximity = actor.position.clone().sub(otherActor.position).mag();
                        var thickness = (actor.size + otherActor.size) / 2;
                        if(proximity - thickness < 0){

                            // collision!
                            destroyActor(actor);
                            destroyActor(otherActor);

                            if(otherActor.type == 'rocket' || otherActor.type == 'bullet'){
                                var otherPlayer = otherActor.parent.parent;
                                otherPlayer.score++;
                            
                                app.trigger('player_scores', {
                                    id : otherPlayer.id,
                                    score : otherPlayer.score
                                });
                            }
                        }
                    }
                }
            },

            seek : function (actor, dt) {
                // seek targets only after the rocket's idle time has passed
                if(settings.rocket.duration - actor.duration > settings.rocket.idleTime){
                    var closestTarget;
                    var minDistance;
                    
                    for(id in actors.player){
                        var target = actors.player[id];

                        // do not seek parent player
                        if(target.id == actor.parent.id){
                            continue;
                        }

                        var distance = target.position.clone().sub(actor.position).mag();
                        if(!closestTarget || distance < minDistance){
                            minDistance = distance;
                            closestTarget = target;
                        }
                    }

                    if(closestTarget && minDistance < settings.rocket.seekRange){
                        var desired = closestTarget.position.clone().sub(actor.position);
                        desired.normalize().mult(settings.rocket.maxSpeed);
                        var steer = desired.sub(actor.velocity).limit(settings.rocket.cornering);
                        actor.thrust.add(steer);
                    }
                }

                actor.acceleration.add(actor.thrust.clone());
            },

            slowdown : function (actor, dt) {
                actor.acceleration.add(actor.friction.clone());
            }
        };

        function getRandomPosition () {
            var x = Math.floor(Math.random() * settings.view.w);
            var y = Math.floor(Math.random() * settings.view.h);
            return new Vector(x, y);
        }

        function getRandomDirection () {
            var x = Math.round(Math.random() * 20 - 10) / 10;
            var y = Math.round(Math.random() * 20 - 10) / 10;
            return new Vector(x, y).normalize();
        }

        function createActor (type, parentObj) {
            var newId = type == 'player' ? parentObj.id : ++idIndex;
            var newActor = {
                id : newId,
                type : type,
                parent : parentObj,
                position : new Vector(),
                velocity : new Vector(),
                acceleration : new Vector(),
                size : settings[type].size
            };

            switch(type){

                case 'player':
                    newActor.steerAngle = 0;
                    newActor.weaponLoaded = true;
                    newActor.heading = getRandomDirection();
                    newActor.position = getRandomPosition();
                    newActor.spriteType = newId % 4;
                    break;

                case 'rocket':
                    // use the midpoint between velocity and heading
                    newActor.velocity = parentObj.heading.clone();
                    newActor.velocity.add(parentObj.velocity);
                    newActor.velocity.normalize().mult(settings.rocket.startSpeed);

                    // must appear in front of the plane
                    newActor.position = parentObj.position.clone();
                    
                    newActor.duration = settings.rocket.duration;
                    newActor.thrust = newActor.velocity.limit(settings.rocket.thrust);
                    break;

                case 'bullet':
                    // use the midpoint between velocity and heading
                    newActor.velocity = parentObj.heading.clone();
                    newActor.velocity.add(parentObj.velocity);
                    newActor.velocity.normalize().mult(settings.bullet.startSpeed);

                    // must appear in front of the plane
                    newActor.position = parentObj.position.clone();
                    
                    newActor.duration = settings.bullet.duration;
                    break;

                case 'debris':
                    newActor.duration = settings.debris.duration;
                    newActor.position = parentObj.position.clone();
                    newActor.velocity = parentObj.velocity.clone();
                    newActor.friction = parentObj.velocity.clone();
                    newActor.friction.normalize().mirror();
                    newActor.friction.mult(settings.debris.friction);
                    break;

                case 'explosion':
                    newActor.duration = settings.explosion.duration;
                    newActor.position = parentObj.position.clone();
            
            }

            actors[type][newId] = newActor;
        }

        function destroyActor (actor) {
            delete actors[actor.type][actor.id];

            switch(actor.type){
                
                case 'player':
                    createActor('debris', actor);
                    setTimeout(function(){
                        addPlayer(actor.parent);
                    }, settings.player.respawnTime);
                    break;

                case 'rocket':
                    createActor('explosion', actor);
                    break;

            }
        }

        function addPlayer (playerObj) {
            createActor('player', playerObj);
        }

        function removePlayer (playerObj) {
            delete actors.player[playerObj.id];
        }
        
        function onCommand (event) {
            var a = actors.player[event.id];
            if(a){
                switch(event.message){

                    case 'tilt':
                        a.steerAngle = event.data.roll;
                        break;

                    case 'left':
                        a.steerAngle = settings.player.steeringStep;
                        break;

                    case 'right':
                        a.steerAngle = -settings.player.steeringStep;
                        break;

                    case 'action':
                        a.shoot = true;
                        break;
                }
            }
        }

        function onLoop (dt) {
            for(var type in actors){
                var actorsOfType = actors[type];
                for(var id in actorsOfType){
                    var behaviorSet = behaviorSets[type];
                    for(var key in behaviorSet){
                        var behaviorName = behaviorSet[key];
                        var actor = actorsOfType[id];
                        behaviors[behaviorName](actor, dt);
                    }
                }
            }
        }
        
        function getViewModel () {
            return {
                actors : actors
            };
        }

        return {
            addPlayer : addPlayer,
            removePlayer : removePlayer,
            onCommand : onCommand,
            onLoop : onLoop,
            getViewModel : getViewModel
        };
    }

    return PlanesController;
});