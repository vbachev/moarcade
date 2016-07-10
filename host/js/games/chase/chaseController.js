define(['games/vector'], function (Vector) {

    function ChaseController (config) {
        var settings = $.extend(true, {}, config);
        var idIndex = 0;
        var agents = {};

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

        function addPlayer (playerObj) {
            createAgent('player', playerObj);
        }

        function removePlayer (playerObj) {
            delete agents['player' + playerObj.id];
        }

        function createAgent (type, parentObj) {
            var newId = type + (type == 'player' ? parentObj.id : ++idIndex);

            var newAgent = {
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
                    newAgent.steerAngle = 0;
                    newAgent.weaponLoaded = true;
                    newAgent.heading = getRandomDirection();
                    newAgent.position = getRandomPosition();
                    break;

                case 'rocket':
                    // use the midpoint between velocity and heading
                    newAgent.velocity = parentObj.heading.clone();
                    newAgent.velocity.add(parentObj.velocity);

                    // must appear in front of the plane
                    newAgent.position = parentObj.position.clone();
                    newAgent.position.add(newAgent.velocity);
                    
                    newAgent.duration = settings.rocket.duration;
                    newAgent.acceleration = newAgent.velocity.limit(settings.rocket.acceleration);
                    break;

                case 'debris':
                    newAgent.duration = settings.debris.duration;
                    newAgent.position = parentObj.position.clone();
                    newAgent.velocity = parentObj.velocity.clone();
                    newAgent.acceleration = parentObj.velocity.clone();
                    newAgent.acceleration.limit(settings.debris.friction);
                    newAgent.acceleration.mirror();
                    break;

                case 'explosion':
                    newAgent.duration = settings.explosion.duration;
                    newAgent.position = parentObj.position.clone();
            
            }
            agents[newId] = newAgent;
        }

        function destroyAgent (agent) {
            delete agents[agent.id];
            
            if(agent.type == 'player'){
                createAgent('debris', agent);
                setTimeout(function(){
                    addPlayer(agent.parent);
                }, settings.player.respawnTime);   
            } else {
                createAgent('explosion', agent);
            }
        }
        
        function onCommand (event) {
            var a = agents['player' + event.id];
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
        
        function handleCollisions (agent) {
            // handle crossing map bounds
            if( agent.position.x < 0 ){
                agent.position.x = settings.view.w;
            } else if( agent.position.x > settings.view.w ){
                agent.position.x = 0;
            } else if( agent.position.y < 0 ){
                agent.position.y = settings.view.h;
            } else if( agent.position.y > settings.view.h ){
                agent.position.y = 0;
            }

            // applies only to these types
            var allowedTypes = ['player'];
            var collisionTypes = ['player', 'rocket'];
            if(allowedTypes.indexOf(agent.type) < 0){
                return;
            }

            // handle hits
            for(var id in agents){
                var otherAgent = agents[id];
                
                // skip self
                if(id == agent.id){
                    continue;
                }

                // skip agents that we cant collide with
                if(collisionTypes.indexOf(otherAgent.type) < 0 || otherAgent.parent.id == agent.id){
                    continue;
                }

                var proximity = agent.position.clone().sub(otherAgent.position).mag();
                var thickness = (agent.size + otherAgent.size) / 2;
                if(proximity - thickness < 0){
                    // collision!
                    destroyAgent(agent);
                    destroyAgent(otherAgent);

                    if(otherAgent.type == 'rocket'){
                        var otherPlayer = otherAgent.parent.parent;
                        otherPlayer.score++;
                        app.trigger('player_scores', {
                            id : otherPlayer.id,
                            score : otherPlayer.score
                        });
                    }
                }
            }
        }

        function onLoop (dt) {
            for(var id in agents){
                var a = agents[id];

                handleCollisions(a);

                if(a.type == 'rocket'){
                    seekTarget(a);
                }

                if(['rocket', 'explosion', 'debris'].indexOf(a.type) >= 0){
                    a.velocity.add(a.acceleration);
                    if(settings[a.type].maxSpeed){
                        a.velocity.limit(settings[a.type].maxSpeed);
                    }
                    a.position.add(a.velocity);
                    a.duration--;
                    if(a.duration < 0){
                        delete agents[a.id];
                    }
                    continue;
                }

                // shift the heading to the left or right if steering occurs
                if(a.steerAngle != 0){
                    var dodge = new Vector();
                    if(a.steerAngle > 0){
                        // right perpendicular of velocity
                        dodge.x = a.velocity.y;
                        dodge.y = a.velocity.x * -1;
                    } else {
                        // left perpendicular of velocity
                        dodge.x = a.velocity.y * -1;
                        dodge.y = a.velocity.x;
                    }
                    dodge.normalize();
                    dodge.mult(Math.tan(Math.PI / 180 * Math.abs(a.steerAngle)));
                    a.heading.add(dodge);
                    a.heading.normalize();
                    
                    a.steerAngle = 0;
                }

                var desiredVelocity = a.heading.clone();
                desiredVelocity.normalize();
                desiredVelocity.mult(settings.player.maxSpeed);
                var steerForce = desiredVelocity.sub(a.velocity);
                steerForce.limit(settings.player.cornering);
                a.acceleration.add(steerForce);

                if(a.shoot && a.weaponLoaded){    
                    createAgent('rocket', a);

                    a.weaponLoaded = false;
                    setTimeout((function(agent){
                        agent.weaponLoaded = true;
                    }).bind(this, a), settings.player.reloadTime);
                }
                a.shoot = false;

                a.velocity.add(a.acceleration);
                a.velocity.limit(settings.player.maxSpeed);
                a.position.add(a.velocity);
                a.acceleration.mult(0);
            }
        }

        function seekTarget (a) {
            var closestTarget;
            var minDistance;
            for(id in agents){
                var target = agents[id];
                if(target.type != 'player' || target.id == a.parent.id){
                    continue;
                }

                var distance = target.position.clone().sub(a.position).mag();
                if(!closestTarget || distance < minDistance){
                    minDistance = distance;
                    closestTarget = target;
                }
            }

            if(closestTarget && minDistance < settings.rocket.seekRange){
                var desired = closestTarget.position.clone().sub(a.position);
                desired.normalize().mult(settings.rocket.maxSpeed);
                var steer = desired.sub(a.velocity).limit(settings.rocket.cornering);
                a.acceleration.add(steer);
            }
        }
        
        function getViewModel () {
            var entities = {};
            for(var id in agents){
                var a = agents[id];
                entities[a.type] = entities[a.type] || [];
                entities[a.type].push(a);
            }

            return {
                agents : entities
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

    return ChaseController;
});