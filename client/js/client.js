var connection;
var emitIntervals = {};
var emitPeriod = 300;
var interactionEvent = 'click';
if('ontouchstart' in document.documentElement){
    interactionEvent = 'touchstart touchend';
}
var tiltData = {};

function bindEventHandlers () {
    connection.on('welcome', function (id) {
        //
    });

    connection.on('game_started', function (gameKey) {
        $(document.body).removeClass('waiting').addClass('game-' + gameKey);
    });

    $('#joinButton').on('click', function(){
        connection.emit('player_ready', {
            name : document.getElementById('name').value,
            room : window.location.href.split('host=')[1]
        });
        $(document.body).addClass('joined');

        $('.login').remove(); // well ... that escalated quickly!
    });

    $('.keys .button').on(interactionEvent, function (e) {
        var command = $(this).data('commandname');
        switch(e.type){
            
            case 'touchstart':
                startEmitting(command);
                break;

            case 'touchend':
                stopEmitting(command);
                break;
            
            case 'click':
                emit(command);
                break;
        } 
    }).on('click', function(){});

    if(window.DeviceOrientationEvent){
        window.addEventListener('deviceorientation', function(eventData) {
            // gamma is the left-to-right tilt in degrees, where right is positive
            tiltData.lr = Math.round(eventData.gamma);
            // beta is the front-to-back tilt in degrees, where front is positive
            tiltData.fb = Math.round(eventData.beta);
            // alpha is the compass direction the device is facing in degrees
            // tiltData.dir = Math.round(eventData.alpha);

            var roll = tiltData.fb;
            roll *= tiltData.lr < 0 ? -1 : 1;
            roll = roll > 90 ? 90 : roll < -90 ? -90 : roll;
            tiltData.roll = roll;

            // if(Math.abs(tiltData.fb) > Math.abs(tiltData.lr)){
            //     if(tiltData.fb > 0){
            //         tiltData.orientation = 0;
            //     } else {
            //         tiltData.orientation = 2;
            //     }
            // } else {
            //     if(tiltData.lr > 0){
            //         tiltData.orientation = 3;
            //     } else {
            //         tiltData.orientation = 1;
            //     }
            // }

        }, false);
        
        setInterval(function () {
            emit('tilt', tiltData);
        }, emitPeriod);
    }
}

function emit (commandName, data) {
    connection.emit('command', commandName, data);
}

function startEmitting (eventName) {
    emit(eventName);
    stopEmitting(eventName);
    emitIntervals[ eventName ] = setInterval(function () {
        emit(eventName);
    }, emitPeriod);
}

function stopEmitting (eventName) {
    clearInterval(emitIntervals[ eventName ]);
}

$(function(){
    connection = io.connect('/');
    bindEventHandlers();
});