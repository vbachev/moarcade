define(['games/resource', 'games/sprite'], function (Resource, Sprite) {

    function PlanesView (config) {
        var settings = $.extend(true, {}, config);
        var context;
        var shadow = [1, 3];
        var templates = {
            terrain : {
                source : 'img/sea.png'
            },
            plane0 : {
                source : 'img/fighters.png',
                x : 50,
                y : 37,
                w : 100,
                h : 100,
                size : [
                    settings.player.size,
                    settings.player.size
                ]
            },
            plane1 : {
                source : 'img/fighters.png',
                x : 50,
                y : 200,
                w : 100,
                h : 100,
                size : [
                    settings.player.size,
                    settings.player.size
                ]
            },
            plane2 : {
                source : 'img/fighters.png',
                x : 200,
                y : 37,
                w : 100,
                h : 100,
                size : [
                    settings.player.size,
                    settings.player.size
                ]
            },
            plane3 : {
                source : 'img/fighters.png',
                x : 200,
                y : 200,
                w : 100,
                h : 100,
                size : [
                    settings.player.size,
                    settings.player.size
                ]
            },
            rocket : {
                source : 'img/missile_2.png',
                w : 47,
                h : 12,
                size : [
                    settings.rocket.size * 2,
                    settings.rocket.size / 2
                ]  
            },
            explosion : {
                source : 'img/explosion.png',
                x : 0,
                y : 0,
                w : 33,
                h : 33,
                speed : 5 / settings.rocket.duration / 60,
                frames : [0, 1, 2, 3, 4, 5],
                size : [
                    settings.explosion.size,
                    settings.explosion.size
                ]
            },
            debris : {
                source : 'img/explosion2.png',
                x : 0,
                y : 0,
                w : 65,
                h : 65,
                speed : 6 / settings.debris.duration / 60,
                frames : [0, 1, 2, 3, 4, 5, 6],
                size : [
                    settings.debris.size,
                    settings.debris.size
                ]
            }
        };

        // rendering for each type of actor
        var renderHandlers = {
            
            player : function (actor) {
                if(!actor.sprite){
                    // random plane sprite
                    var key = 'plane' + actor.spriteType;
                    actor.sprite = new Sprite(templates[key]);
                }

                context.save();
                context.translate(actor.position.x, actor.position.y);

                // shadow
                context.beginPath();
                context.arc(
                    // shadow[0], shadow[1],
                    // 0,0, 
                    actor.heading.x * 5, actor.heading.y * 5,
                    settings.player.size / 3, 
                    0, 2 * Math.PI, false);

                context.strokeStyle = 'black';
                // context.strokeStyle = actor.parent.color;
                // context.setLineDash([4, 4]);
                context.lineWidth = 1;
                // context.globalAlpha = 0.8;
                context.stroke();
                
                context.fillStyle = actor.parent.color;
                context.globalAlpha = 0.5;
                context.fill();

                context.globalAlpha = 1;

                // heading
                // context.beginPath();
                // context.arc(
                //     actor.heading.x * 30, actor.heading.y * 30, 
                //     settings.player.size / 10, 
                //     0, 2 * Math.PI, false);
                // context.fillStyle = actor.parent.color;
                // context.globalAlpha = 0.7;
                // context.fill();
                // context.globalAlpha = 1;
                
                // plane
                context.rotate(actor.velocity.angle());
                actor.sprite.render(context);

                context.restore();
            },

            debris : function (actor) {
                if(!actor.sprite){
                    actor.sprite = new Sprite(templates[actor.type]);
                }
                
                context.save();
                context.translate(actor.position.x, actor.position.y);
                actor.sprite.render(context);
                context.restore();
            },

            bullet : function (actor) {
                context.save();
                context.translate(actor.position.x, actor.position.y);
                context.rotate(actor.velocity.angle());

                context.beginPath();
                context.arc(
                    0,0, 
                    settings.bullet.size, 
                    0, 2 * Math.PI, false);

                context.strokeStyle = 'black';
                // context.strokeStyle = actor.parent.color;
                // context.setLineDash([4, 4]);
                context.lineWidth = 1;
                // context.globalAlpha = 0.8;
                context.stroke();
                
                context.fillStyle = actor.parent.parent.color;
                // context.globalAlpha = 0.5;
                context.fill();

                // context.globalAlpha = 1;

                context.restore();  
            },

            rocket : function (actor) {
                if(!actor.sprite){
                    actor.sprite = new Sprite(templates.rocket);
                }

                context.save();
                context.translate(actor.position.x, actor.position.y);
                context.rotate(actor.velocity.angle());
                actor.sprite.render(context);
                context.restore();
            },

            explosion : function (actor) {
                if(!actor.sprite){
                    actor.sprite = new Sprite(templates[actor.type]);
                }
                
                context.save();
                context.translate(actor.position.x, actor.position.y);
                actor.sprite.render(context);
                context.restore();
            }
        };

        function initialize () {
            // create and place the canvas
            var $canvas = $('<canvas id="theCanvas"/>').appendTo('.gameboard');
            context = $canvas[0].getContext('2d');
            
            // set the canvas dimensions
            settings.canvas = {
                w : $canvas.width(),
                h : $canvas.height()
            };
            context.canvas.width = settings.canvas.w;
            context.canvas.height = settings.canvas.h;

            // preload resources
            for(var key in templates){
                Resource.load(templates[key].source);
            }

            Resource.onReady(function () {
                for(var key in templates){
                    var t = templates[key];
                    t.image = Resource.get(t.source);
                }

                // terrain
                templates.terrain.pattern = context.createPattern(templates.terrain.image, 'repeat');
            });
        }

        function onLoop (data) {
            context.clearRect(0, 0, settings.canvas.w, settings.canvas.h);

            // terrain
            context.fillStyle = templates.terrain.pattern;
            context.fillRect(0, 0, settings.canvas.w, settings.canvas.h);

            var renderOrder = [
                'debris',
                'explosion',
                'rocket',
                'bullet',
                'player'
            ];
            for(var i = 0; i < renderOrder.length; i++){
                var actors = data.viewModel.actors[renderOrder[i]];
                for(var id in actors){
                    var a = actors[id];
                    renderHandlers[a.type](a);
                }
            }
        }

        initialize ();
        return {
            getDimensions : function () {
                return settings.canvas;
            },
            onLoop : onLoop,
            onReady : Resource.onReady
        };   
    }

    return PlanesView;
});