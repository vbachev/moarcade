define([ 'jquery' ], function ( $ ) {

    return function () {
        var handlers = [];
        var fired = false;
        var delay = 20;

        function execute ( keyName ) {
            handlers.forEach( function ( handler ) {
                handler( keyName );
            });
        }

        $( window ).on( 'keydown', function( e ) {
            if( !fired ){
                fired = true;
                setTimeout( function(){
                    fired = false;
                }, delay );

                // console.log( 'Keyboard:', e.keyCode );

                switch( e.keyCode ){
                    case 38: // UP
                        execute('up');
                        break;
                    case 40: // DOWN
                        execute('down');
                        break;
                    case 39: // RIGHT
                        execute('right');
                        break;
                    case 37: // LEFT
                        execute('left');
                        break;
                    case 32: // SPACE
                        execute('space');
                        break;
                    case 87: // W
                        execute('w');
                        break;
                    case 68: // D
                        execute('d');
                        break;
                    case 83: // S
                        execute('s');
                        break;
                    case 65: // LEFT
                        execute('a');
                        break;
                }
            }
        });

        return {
            addHandler : function ( callback ) {
                handlers.push( callback );
            }
        }
    }

});