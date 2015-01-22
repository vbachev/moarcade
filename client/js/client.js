var clientId = 0;
var connection;

function bindEventHandlers () {
    $('#joinButton').on( 'click', function(){
        connection.emit( 'player_ready', {
            id : clientId,
            name : document.getElementById('name').value,
            room : window.location.href.split('host=')[1]
        });
        document.body.className = 'joined';
    });

    $('#upButton').on( 'touchstart', function(){
        connection.emit( 'up', clientId );
    });

    $('#rightButton').on( 'touchstart', function(){
        connection.emit( 'right', clientId );
    });

    $('#downButton').on( 'touchstart', function(){
        connection.emit( 'down', clientId );
    });

    $('#leftButton').on( 'touchstart', function(){
        connection.emit( 'left', clientId );
    });

    $(window).on( 'shake', function(){
        connection.emit( 'shake', clientId );
    });
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