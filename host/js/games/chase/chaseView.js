define([], function () {

    function ChaseView (config) {
        var settings = $.extend(true, {}, config);
        

        var myCanvas = $('<canvas id="theCanvas"/>').appendTo('.gameboard');
        var ctx = myCanvas[0].getContext('2d');
        var canvasSize = {
            w : myCanvas.width(),
            h : myCanvas.height()
        };

        ctx.canvas.width = canvasSize.w;
        ctx.canvas.height = canvasSize.h;



        var p = {
            speed : 1,
            dir : 1,
            // size : 10,
            size : 7,
            pos : {
                x : 100,
                y : 100
            }
        };

        p.pos.x += p.speed * (p.dir == 1 ? 1 : (p.dir == 3 ? -1 : 0));
        p.pos.y += p.speed * (p.dir == 2 ? 1 : p.dir == 0 ? -1 : 0);



        return {
            getDimensions : function () {
                return canvasSize;
            },
            onLoop : function (data) {
                ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
                for(var id in data.viewModel.agents){
                    var a = data.viewModel.agents[id];
                    
                    ctx.beginPath();
                    ctx.rect(a.position.x, a.position.y, p.size, p.size);
                    ctx.fillStyle = a.parent.color || 'red';
                    ctx.fill();
                    ctx.closePath();

                    // vel
                    // ctx.beginPath();
                    // ctx.rect(a.position.x + a.velocity.x*-5, a.position.y + a.velocity.y*-5, 3, 3);
                    // ctx.fillStyle = a.parent.color;
                    // ctx.fill();
                    // ctx.closePath();

                    // dir
                    // ctx.beginPath();
                    // ctx.rect(a.position.x + a.direction.x, a.position.y + a.direction.y, 2, 2);
                    // ctx.fillStyle = a.parent.color;
                    // ctx.fill();
                    // ctx.closePath();

                    // acc
                    // ctx.beginPath();
                    // ctx.rect(a.position.x + a.acceleration.x*5, a.position.y + a.acceleration.y*5, 2, 2);
                    // ctx.fillStyle = a.parent.color;
                    // ctx.fill();
                    // ctx.closePath();
                }
            }
        };   
    }

    return ChaseView;
});