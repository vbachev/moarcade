define([ 'app/puppeteer', 'qrcode' ], function ( Puppeteer, _QRCode ) {

    var View = function( config ){

        var playersJoined=[];
        var playersLeft=[];

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
                $('.stage').attr( 'style', [
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

                        // print score
                        if( item.score !== item.lastScore ){
                            $('#player-'+item.id+' b').text(item.score);
                            item.lastScore == item.score;
                        }

                        // print new joiner text
                        if( playersJoined.indexOf(item.id) > -1 ){
                            $('.players').append( $('<li id="player-'+item.id+'" style="color:'+item.color+'">'+(item.name || 'Anonymous '+item.id)+' - <b>'+item.score+'</b></li>'));
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