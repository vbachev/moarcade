define(function(){
    var mainLoopCallback = function () {};
    var isPaused = false;
    var isStopped = true;
    var lastTime = 0;

    function getTimeDelta () {
        var newTime = Date.now();
        var dt = (newTime - lastTime) / 1000;
        lastTime = newTime;
        return dt;
    }

    function mainLoop () {
        if(!isPaused){
            mainLoopCallback(getTimeDelta());
        }
        if(!isStopped){
            requestAnimationFrame(mainLoop);
        }
    }

    return {
        start : function( callback ){
            isStopped = false;
            isPaused = false;
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