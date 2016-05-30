var clientId = 0;
var connection;
var emitIntervals = {};
var emitPeriod = 300;

function bindEventHandlers () {
    $('#joinButton').on( 'click', function(){
        connection.emit( 'player_ready', {
            id : clientId,
            name : document.getElementById('name').value,
            room : window.location.href.split('host=')[1]
        });
        document.body.className = 'joined';

        $('.login').remove(); // well ... that escalated quickly!
    });

    $('#upButton')
        .on( 'touchstart', function(){ startEmitting( 'up' ); })
        .on( 'touchend',   function(){  stopEmitting( 'up' ); });

    $('#rightButton')
        .on( 'touchstart', function(){ startEmitting( 'right' ); })
        .on( 'touchend',   function(){  stopEmitting( 'right' ); });

    $('#downButton')
        .on( 'touchstart', function(){ startEmitting( 'down' ); })
        .on( 'touchend',   function(){  stopEmitting( 'down' ); });

    $('#leftButton')
        .on( 'touchstart', function(){ startEmitting( 'left' ); })
        .on( 'touchend',   function(){  stopEmitting( 'left' ); });

    $(window).on( 'shake', function(){
        emit('shake');
    });
}

function emit ( eventName ) {
    connection.emit( eventName, clientId );
}

function startEmitting ( eventName ) {
    emit( eventName );
    stopEmitting( eventName );
    emitIntervals[ eventName ] = setInterval( function () {
        emit( eventName );
    }, emitPeriod );
}

function stopEmitting ( eventName ) {
    clearInterval( emitIntervals[ eventName ] );
}

$(function(){
    connection = io.connect('/');

    connection.on('welcome', function (data) {
        clientId = data;
    });

    var shakeDetector = new Shake({
        threshold: 10, // shake strength threshold
        timeout: 500 // frequency of event generation
    });
    shakeDetector.start();

    bindEventHandlers();
});