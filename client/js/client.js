var connection;
var emitIntervals = {};
var emitPeriod = 300;

function bindEventHandlers () {
    connection.on('welcome', function ( playerId ) {
        // clientId = data;
    });

    $('#joinButton').on( 'click', function(){
        connection.emit( 'player_ready', {
            name : document.getElementById('name').value,
            room : window.location.href.split('host=')[1]
        });
        document.body.className = 'joined';

        $('.login').remove(); // well ... that escalated quickly!
    });

    $('.keys .button').on( 'touchstart touchend click', function ( e ) {
        var command = $(this).data('commandname');
        switch( e.type ){
            
            case 'touchstart':
                startEmitting( command );
                break;

            case 'touchend':
                stopEmitting( command );
                break;
            
            case 'click':
                emit( command );
                break;
        } 
    });

    $(window).on( 'shake', function(){
        emit('shake');
    });
}

function emit ( commandName ) {
    connection.emit( 'command', commandName );
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

    var shakeDetector = new Shake({
        threshold: 10, // shake strength threshold
        timeout: 500 // frequency of event generation
    });
    shakeDetector.start();

    bindEventHandlers();
});