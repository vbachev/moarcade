define([ 'games/puppeteer', 'qrcode' ], function ( Puppeteer, _QRCode ) {

    var View = function( config ){

        var settings = {
            stage : {
                width : 600,
                height : 600
            }
        };
        $.extend( true, settings, config );

        var puppeteer = new Puppeteer();

        return {

            initialize : function () {
                var stage = $('<div class="stage"/>').appendTo('.gameboard');
                $('<div class="puppeteer"/>').css({
                    width : 2,
                    height : 2,
                    borderRadius : 1
                }).appendTo(stage);

                stage.attr( 'style', [
                    'width:'+settings.stage.width+'px;',
                    'height:'+settings.stage.height+'px;'
                ].join(' '));
            },

            render : function ( DTOs ){
                for( var key in DTOs ){
                    var item = DTOs[ key ];

                    puppeteer.addParticle( item.position.x, item.position.y, {
                        size : item.size/2,
                        color : item.color,
                        blur : item.blur || 0
                    });

                    if( item.type == 'player' ){

                        // print health
                        for( var i=0; i < item.health; i++ ){
                            puppeteer.addParticle( item.position.x - 5 + (i*5), item.position.y - 20, {
                                size : 1,
                                color : 'red'
                            });
                        }
                    }
                }
                puppeteer.render();
            }
        };
    };

    return View;
});