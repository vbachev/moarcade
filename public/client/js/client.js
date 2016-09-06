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
        
        toggleFullScreen(document.documentElement);
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
            var lr = Math.round(eventData.gamma);
            var fb = Math.round(eventData.beta);

            // skip wierd blank glitches
            if(lr == 0 && fb == 0){
                return;
            }

            // gamma is the left-to-right tilt in degrees, where right is positive
            tiltData.lr = lr;
            // beta is the front-to-back tilt in degrees, where front is positive
            tiltData.fb = fb;
            // alpha is the compass direction the device is facing in degrees
            // tiltData.dir = Math.round(eventData.alpha);

            // normalization of tilt
            var roll = tiltData.fb;
            roll *= tiltData.lr < 0 ? -1 : 1;
            roll = roll > 90 ? 90 : roll < -90 ? -90 : roll;
            tiltData.roll = roll;
        }, false);
        
        setInterval(function () {
            emit('tilt', tiltData);
        }, 30);
    }
}

// emit an event once
function emit (commandName, data) {
    connection.emit('command', commandName, data);
}

// emit once and set an interval to periodically emit an event
function startEmitting (eventName) {
    emit(eventName);
    stopEmitting(eventName);
    emitIntervals[ eventName ] = setInterval(function () {
        emit(eventName);
    }, emitPeriod);
}

// stop periodic emitting
function stopEmitting (eventName) {
    clearInterval(emitIntervals[ eventName ]);
}

// HTML5 FullScreen API
function toggleFullScreen (targetElement) {
    if (!document.mozFullScreen && !document.webkitFullScreen) {
        if (targetElement.mozRequestFullScreen) {
            targetElement.mozRequestFullScreen();
        } else {
            targetElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else {
            document.webkitCancelFullScreen();
        }
    }
}

$(function(){
    connection = io.connect('/');
    bindEventHandlers();
});