define([ 'game/puppeteer', 'qrcode' ], function ( Puppeteer, _QRCode ) {

    var View = function( config ){

        var settings = {
            grid : {
                width : 100,
                height : 100,
                cellSize : 20
            }
        };
        $.extend( true, settings, config );

        var puppeteer = new Puppeteer();

        return {

            initialize : function () {
                var cellSize = settings.grid.cellSize + 1;
                var halfCellSize = settings.grid.cellSize / 2 + 1;
                var stage = $('<div class="stage"/>').appendTo('.gameboard');
                stage.append('<div class="puppeteer"/>');


                stage.attr( 'style', [
                    'width:'+( settings.grid.width * cellSize + 1 )+'px;',
                    'height:'+( settings.grid.height * cellSize + 1 )+'px;',
                    '-webkit-background-size:' + cellSize + 'px ' + cellSize + 'px;',
                    '-moz-background-size:' + cellSize + 'px ' + cellSize + 'px;',
                    'background-size:' + cellSize + 'px ' + cellSize + 'px;'
                ].join(' '))
                .find('.puppeteer').css({
                    top : halfCellSize,
                    left : halfCellSize
                });
            },

            render : function ( DTOs ){
                var cellSize = settings.grid.cellSize + 1;
                for( var key in DTOs ){
                    var item = DTOs[ key ];
                    puppeteer.addParticle( item.position.x * cellSize, item.position.y * cellSize, { color : item.color } );

                    if( item.type=='player' ){

                        // print tail
                        item.tail.forEach( function ( tailItem ) {
                            puppeteer.addParticle( tailItem.x * cellSize, tailItem.y * cellSize, { color : item.color, size : 6 } );
                        });
                    }
                }
                puppeteer.render();
            }
        };
    };

    return View;
});