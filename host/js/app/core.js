define(function(){

    var Core = function ( config ) {

        var topics = {};

        return {

            on : function ( eventName, handler ) {
                if( !topics[ eventName ]){
                    topics[ eventName ] = [];
                }

                topics[ eventName ].push( handler );
            },

            trigger : function ( eventName, data ) {
                if( !topics[ eventName ]){
                    return;
                }

                topics[ eventName ].forEach( function ( handler ) {
                    handler( data );
                });

            }
        };
    };

    return Core;
});