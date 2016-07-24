define([], function () {

    var resourceCache = {};
    var readyCallbacks = [];

    // Load an image url or an array of image urls
    function load (urlOrArr) {
        var urls = Array.prototype.slice.call(arguments);
        urls.forEach(function (url) {
            _load(url);
        });
    }

    function _load (url) {
        if(typeof resourceCache[url] != 'undefined') {
            return;
        }

        var img = new Image();
        img.onload = function() {
            resourceCache[url] = img;
            
            if(isReady()) {
                readyCallbacks.forEach(function(func) { func(); });
            }
        };
        resourceCache[url] = false;
        img.src = url;
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
                continue;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    return { 
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };

});