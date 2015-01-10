define([ 'app/puppeteer' ], function ( Puppeteer ) {
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
                        if( playersJoined.indexOf(item.id) > -1 ){
                            $('.players').append( $('<li class="player-'+item.id+'" style="color:'+item.color+'">'+(item.name || 'Anonymous')+'</li>'));
                        }
                    }
                }
                puppeteer.render();


                playersLeft.forEach(function( id ){
                    $('.players').find('.player-'+id).remove();
                });
                playersJoined=[];
                playersLeft=[];
            },

            addPlayer : function ( data ){
                playersJoined.push(data.id);
            },

            removePlayer : function ( data ){
                playersLeft.push(data.id);
            }
        };
    };

    return View;
});