define([], function () {
    var defaults = {
        image : null,
        x : 0,
        y : 0,
        w : 0,
        h : 0,
        speed : 0,
        direction : 0,
        frames : [0],
        size : [0, 0],

    };

    function Sprite (config) {
        $.extend(true, this, defaults, config);

        this.index = 0;
    }

    Sprite.prototype = {
        render : function (context) {
            var frame = 0;

            if(this.speed > 0){
                this.index += this.speed;
                var orderIndex = Math.floor(this.index) % this.frames.length
                frame = this.frames[orderIndex] || orderIndex;
            }

            var x = this.x;
            var y = this.y;

            if(this.direction == 1){
                y += frame * this.h;
            } else {
                x += frame * this.w;
            }

            context.drawImage(
                this.image,
                x, y,
                this.w, this.h,
                this.size[0] * -1 / 2, this.size[1] * -1 / 2,
                this.size[0], this.size[1]
            );
        }
    };

    return Sprite;
});