define([ 'jquery' ], function ( $ ) {
    'use strict';

    var Puppeteer = function ( config ) {

        var shadows = [];
        var node;
        var defaults = {
            node : '.puppeteer',
            particleAttributes : {
                color : 'red',
                size : 8,
                blur : 0
            }
        };
        var settings = $.extend( {}, defaults, config );

        function render () {
            node = node || $(settings.node);
            node.css( 'box-shadow', shadows.join(', ') );
            shadows = [];
        }

        function addParticle ( x, y, attr ) {
            x = x || 0;
            y = y || 0;

            var attributes = $.extend({}, settings.particleAttributes, attr );

            shadows.push([
                x + 'px',
                y + 'px',
                attributes.blur + 'px',
                attributes.size + 'px',
                attributes.color
            ].join(' '));
        }

        function addParticles ( points ) {
            for( var index in points ){
                puppeteer.addParticle( points[index][0], points[index][1] );
            }
        }

        return {
            render : render,
            addParticle : addParticle,
            addParticles : addParticles
        }
    };

    return Puppeteer;
});