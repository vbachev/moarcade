define(function(){

    var Observer = function () {
        // ensure scope is never global
        var target = this.window && this.window == this ? {} : this;
        var _observer = {};

        if( target instanceof EventTarget ){

            _observer.listeners = [];

            _observer.addListener = function ( eventType, handler ) {
                _observer.listeners.push({
                    type : eventType,
                    handler : handler
                });
                this.addEventListener( eventType, handler, true );
            };

            _observer.removeListener = function ( eventType, handler ) {
                for( var i = _observer.listeners.length - 1; i >= 0; i-- ){
                    var listener = _observer.listeners[ i ];
                    if(( !eventType || eventType == listener.type ) && ( !handler || handler == listener.handler )){
                        this.removeEventListener( listener.type, listener.handler, true );
                        _observer.listeners.splice( i, 1 );
                    }
                }
            };

            _observer.triggerListener = function ( eventType, data ) {
                var newEventObj;

                if( document.createEvent ){
                    newEventObj = document.createEvent( 'HTMLEvents' );
                    newEventObj.initEvent( eventType, true, true );
                } else {
                    newEventObj = document.createEventObject();
                    newEventObj.eventType = eventType;
                }

                newEventObj.eventName = eventType;
                newEventObj.data = data;

                if( document.createEvent ){
                    this.dispatchEvent( newEventObj );
                } else {
                    this.fireEvent( 'on' + newEventObj.eventType, newEventObj );
                }
            };

        } else {

            _observer.listeners = {};

            _observer.addListener = function ( eventType, handler ) {
                _observer.listeners[ eventType ] = _observer.listeners[ eventType ] || [];
                _observer.listeners[ eventType ].push( handler );
            };

            _observer.removeListener = function ( eventType, handler ) {
                if( eventType ){
                    var callbacks = _observer.listeners[ eventType ];
                    if( callbacks ){
                        for( var i = callbacks.length - 1; i >= 0; i-- ){
                            var listener = callbacks[ i ];
                            if( !handler || handler == listener ){
                                callbacks.splice( i, 1 );
                            }
                        }
                    }
                } else {
                    for( listenersKey in _observer.listeners ){
                        _observer.removeListener.call( this, listenersKey, handler );
                    }
                }
            };

            _observer.triggerListener = function ( eventType, data ) {
                var callbacks = _observer.listeners[ eventType ];
                if( !callbacks ){
                    return;
                }

                for( var i = 0, j = callbacks.length; i < j; i++ ){
                    var boundCallback = callbacks[ i ].bind( this, {
                        type : eventType,
                        data : data
                    });
                    // setTimeout( boundCallback, 0 );
                    boundCallback();
                }
            };

        }

        target._observer = _observer;

        // @TODO: implement .once() or .one()
        target.on = function ( eventType, handler ) {
            // @TODO: implement 'all' special event type
            // @TODO: implement dot notation event namespacing
            // @TODO: implement event delegation
            // @TODO: return listener ID for quick removal
            if( !eventType || !handler ){
                console.error('Invalid arguments for .on()');
                return;
            }

            var eventTypes = eventType.split(' ');
            for( var i = 0, j = eventTypes.length; i < j; i++ ){
                _observer.addListener.call( this, eventTypes[ i ], handler );
            }
        };

        target.off = function ( eventType, handler ) {
            eventType = eventType || '';
            var eventTypes = eventType.split(' ');
            for( var i = 0, j = eventTypes.length; i < j; i++ ){
                _observer.removeListener.call( this, eventTypes[ i ], handler );
            }
        };

        target.trigger = function ( eventType, data ) {
            if( !eventType ){
                console.error('Invalid arguments for .trigger()');
                return;
            }

            var eventTypes = eventType.split(' ');
            for( var i = 0, j = eventTypes.length; i < j; i++ ){
                _observer.triggerListener.call( this, eventTypes[ i ], data );
            }
        };
    }

    return Observer;
});