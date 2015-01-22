define(function(){

    var Loop = function( fps ){

        var interval;
        var isPaused = false;
        var delay = fps || 1000 / 60; // 60fps
        var lastTime;

        function getTimeDelta () {
            var newTime = new Date();
            var dt = newTime - lastTime;
            lastTime = newTime;
            return dt;
        }

        return {
            start : function( callback ){
                interval = setInterval( function(){
                    if( !isPaused ){
                        callback( getTimeDelta() );
                    }
                }, delay );
            },

            pause : function(){
                isPaused = true;
            },

            resume : function(){
                isPaused = false;
            },

            stop : function(){
                clearInterval( interval );
            }
        };
    };

    return Loop;
});