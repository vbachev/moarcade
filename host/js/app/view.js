define([ 'app/puppeteer', 'qrcode' ], function ( Puppeteer, _QRCode ) {
    'use strict';

    var View = function( config ){

        var playersJoined=[];
        var playersLeft=[];

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
                $('.stage').attr( 'style', [
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

                        // print new joiner text
                        if( playersJoined.indexOf(item.id) > -1 ){
                            $('.players').append( $('<li class="player-'+item.id+'" style="color:'+item.color+'">'+(item.name || 'Anonymous '+item.id)+'</li>'));
                        }
                    }
                }
                puppeteer.render();

                // remove player text
                playersLeft.forEach( function ( id ) {
                    $('.players').find('.player-'+id).remove();
                });

                // empty arrays
                playersJoined=[];
                playersLeft=[];
            },

            addPlayer : function ( data ) {
                playersJoined.push(data.id);
            },

            removePlayer : function ( data ) {
                playersLeft.push(data.id);
            },

            setURL : function ( data ) {
                $('.joinMessage').html('Join game at <br><a href="'+data.url+'" target="_blank">'+data.url+'</a>');

                $('.qrCode').empty();
                new QRCode( $('.qrCode')[0], {
                    text: data.url,
                    width: 180,
                    height: 180,
                    colorDark : "#333",
                    colorLight : "#eee"
                });
            }
        };
    };

    return View;
});