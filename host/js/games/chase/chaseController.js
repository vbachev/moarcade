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

        function killPlayer (agent) {
            createAgent('explosion', agent);
            delete agents[agent.id];
            setTimeout(function(){
                addPlayer(agent.parent);
            }, settings.player.respawnTime);   
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
                acceleration : new Vector()
            };

            switch(type){

                case 'player':
                    newAgent.steerAngle = 0;
                    newAgent.heading = getRandomDirection();
                    newAgent.position = getRandomPosition();
                    break;

                case 'explosion':
                    newAgent.duration = settings.explosion.duration;
                    newAgent.position = parentObj.position.clone();
                    newAgent.velocity = parentObj.velocity.clone();
                    newAgent.acceleration = parentObj.velocity.clone();
                    newAgent.acceleration.limit(settings.explosion.friction);
                    newAgent.acceleration.mirror();
                    break;
            
            }
            agents[newId] = newAgent;
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
                        createAgent('explosion', a);
                        break;
                }
            }
        }
        
        function handleCollisions (agent) {
            // applies only to these types
            var allowedTypes = ['player'];
            var collisionTypes = ['player'];
            if(allowedTypes.indexOf(agent.type) < 0){
                return;
            }

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

            // handle hits
            for(var id in agents){
                var otherAgent = agents[id];
                
                // skip self
                if(id == agent.id){
                    continue;
                }

                // skip agents that we cant collide with
                if(collisionTypes.indexOf(otherAgent.type) < 0){
                    continue;
                }

                var proximity = agent.position.clone().sub(otherAgent.position);
                if(proximity.mag() < 10){
                    // collision!
                    killPlayer(agent);
                    killPlayer(otherAgent);
                }
            }
        }

        function onLoop (dt) {
            for(var id in agents){
                var a = agents[id];

                handleCollisions(a);

                if(a.type == 'explosion'){
                    a.velocity.add(a.acceleration);
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

                // var desiredVelocity = a.position.clone();
                // desiredVelocity.add(a.heading).sub(a.position);
                var desiredVelocity = a.heading.clone();
                desiredVelocity.normalize();
                desiredVelocity.mult(settings.player.maxSpeed);
                var steerForce = desiredVelocity.sub(a.velocity);
                steerForce.limit(settings.player.cornering);
                a.acceleration.add(steerForce);

                a.velocity.add(a.acceleration);
                a.velocity.limit(settings.player.maxSpeed);
                a.position.add(a.velocity);
                a.acceleration.mult(0);
            }
        }
        
        function getViewModel () {
            return {
                agents : agents
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