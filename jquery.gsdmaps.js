;(function($) {

    // gsdMaps plugin removes 'Static' from Google Static Maps!

    $.fn.gsdMaps = function(options) {
        var opts = $.extend(true, {}, $.fn.gsdMaps.defaults, options);

        // extract the parameters from the first IMG encountered
        var g = extractParams($(this).attr('src'));

        // if g.key is present, parameters have been successfully extracted
        // therefore we can proceed
        if (g.key) {

            // load the Google Maps JavaScript
            loadScript(g.key);

            // create our map-holding div
            var $wrapper = $('<div />').attr(opts.wrapperAttrs).css(opts.wrapperCSS);

            return this.each(function() {
                var $this = $(this);
                var $src = $this.attr('src');
                $this.wrap($wrapper);
                $this.css({'cursor' : 'pointer'});

                $this.click(function() {
                    $this.css({'opacity' : '0.3'});
                    var gMapPars = parseParams($src);

                    // GMap2 constructor accepts only a DOM element, no jQuery sugar
                    var mapEl = $this.parent().get(0);
                    $(mapEl).css({'width' : gMapPars.width, 'height' : gMapPars.height});

                    // init map
                    var map = new GMap2(mapEl);
                    map.setCenter(new GLatLng(gMapPars.latitude, gMapPars.longitude), gMapPars.zoom);

                    // init markers
                    if (gMapPars.markers) {
                        for (var i=0; i<gMapPars.markers.length; i++) {
                            map.addOverlay(new GMarker(new GLatLng(gMapPars.markers[i].latitude, gMapPars.markers[i].longitude)));
                        }
                    }

                    // init controls
                    var mapControl = new GMapTypeControl();
                    map.addControl(mapControl);
                    map.addControl(new GLargeMapControl3D());
                });
            });

        }

        // private function for debugging
        function debug($obj) {
            if (window.console && window.console.log) {
                window.console.log($obj);
            }
        }

        // this function loads Google Maps js
        function loadScript(apiKey) {
            var script = $('<script />');
            script.attr('type', 'text/javascript');
            script.attr('src', 'http://maps.google.com/maps?file=api&v=2&key='+apiKey+'&async=2');
            script.appendTo('body');
        }

        // basic parameter extraction;
        // however, all of them are strings
        function extractParams(src) {
            var paramStr = src.split('?')[1];
            var params = paramStr.split('&');
            var paramHash = [];
            $.each(params, function(i, val) {
                var keyVal = val.split('=');
                paramHash[keyVal[0]] = keyVal[1];
            });
            // basic parameters needed to call Google Maps API;
            // without them the script should fail completely
            var requiredParams = ['center', 'zoom', 'size', 'key'];
            for (par in requiredParams) {
                if (typeof paramHash[requiredParams[par]] !== 'string') {
                    return false;
                }
            }
            return paramHash;
        }

        // parse the extracted parameters 
        // because some of them should be integers, floats or booleans
        function parseParams(src) {

            var gMapParams = extractParams(src);

            for (param in gMapParams) {
                switch (param) {
                    case 'center':
                        var latLng = gMapParams[param].split(',');
                        gMapParams.latitude = parseFloat(latLng[0]);
                        gMapParams.longitude = parseFloat(latLng[1]);
                        delete gMapParams[param];
                        break;
                    case 'markers':
                        var markers = gMapParams[param].split('|');
                        var markersArr = [];
                        var cnt = 0;
                        $.each(markers, function(i, val) {
                            var markerParams = val.split(',');
                            var markerArr = [];
                            $.each(markerParams, function(j, val) {
                                switch (j) {
                                    case 0:
                                        // latitude
                                        markerArr.latitude = parseFloat(val);
                                    break;
                                    case 1:
                                        // longitude
                                        markerArr.longitude = parseFloat(val);
                                    break;
                                    case 2:
                                        // color
                                        markerArr.color = val;
                                    break;
                                }
                            });
                            markersArr[cnt] = markerArr;
                            cnt++;
                        });
                        gMapParams[param] = markersArr;
                        break;
                    case 'zoom':
                        gMapParams[param] = parseInt(gMapParams[param], 10);
                        break;
                    case 'size':
                        var size = gMapParams[param].split('x');
                        gMapParams.width = parseInt(size[0], 10);
                        gMapParams.height = parseInt(size[1], 10);
                        delete gMapParams[param];
                        break;
                    case 'sensor':
                        if (gMapParams[param] === 'true') {
                            gMapParams[param] = true;
                        } else {
                            gMapParams[param] = false;
                        }
                        break;
                }
            }
            return gMapParams;
        }

    };

    // default options
    $.fn.gsdMaps.defaults = {
        wrapperAttrs : {
            'class' : 'map_holder'
        },
        wrapperCSS : {
            //'border'   : '1px solid black',
            'position' : 'relative',
            'display'  : 'inline-block',
            '*display' : 'inline',
            '*zoom'    : '1'
        }
    };

})(jQuery);