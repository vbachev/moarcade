define(function(){
    var mainLoopCallback = function () {};
    var isPaused = false;
    var isStopped = true;
    var lastTime = 0;

    function getTimeDelta (rafTime) {        
        var dt = rafTime - lastTime;
        dt = Math.round(dt) / 1000; // return in s rather than ms
        lastTime = rafTime;

        return dt;
    }

    function mainLoop (rafTime) {
        if(!isPaused){
            mainLoopCallback(getTimeDelta(rafTime));
        }
        if(!isStopped){
            requestAnimationFrame(mainLoop);
        }
    }

    return {
        start : function( callback ){
            isStopped = false;
            isPaused = false;
            lastTime = Date.now();
            mainLoopCallback = callback || mainLoopCallback;
            requestAnimationFrame(mainLoop);
        },

        pause : function(){
            isPaused = true;
        },

        resume : function(){
            isPaused = false;
        },

        stop : function(){
            isStopped = true;
        }
    };
});