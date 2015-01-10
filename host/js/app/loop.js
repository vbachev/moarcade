define(function(){
    'use strict';

    var Loop = function(){

        var interval;
        var isPaused = false;
        var delay = 1000 / 60; // 60fps

        return {
            start : function( callback ){
                interval = setInterval( function(){
                    if( !isPaused ){
                        callback();
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