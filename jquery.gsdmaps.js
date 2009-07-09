(function($) {

    // gsdMaps plugin removes 'Static' from Google Static Maps!
    $.fn.gsdMaps = function(options) {

        if (this.length > 0) {

            var opts = $.extend(true, {}, $.fn.gsdMaps.defaults, options),
                $self = this,
                // extract parameters from the first <img> encountered;
                // we need the API key
                g = extractParams($self.attr('src'));

        } else {

            return false;

        }

        if (g.key) {
            // load the Google Maps JavaScript and call init
            $.getScript('http://maps.google.com/maps?file=api&v=2&key='+g.key+'&async=2&callback=jQuery.fn.gsdMaps.init');
        }

        // Main function - create dynamic map from static
        $.fn.gsdMaps.init = function() {

            // create our map-holding div
            //var $wrapper = $('<div />').attr(opts.wrapperAttrs);
            //var $mapHolder = $('<div />').attr(opts.mapHolderAttrs).css(opts.mapHolderCSS);

            $self.each(function() {
                var $this = $(this);
                var $src = $this.attr('src');

                // create <div>s
                var $wrapper = $('<div />').attr(opts.wrapperAttrs);
                var $mapHolder = $('<div />').attr(opts.mapHolderAttrs).css(opts.mapHolderCSS);

                // ...and apply them
                $this.wrap($wrapper);
                var $wrapEl = $this.parent();
                $wrapEl.append($mapHolder);

                $this.css({'cursor' : 'pointer'});

                var gMapPars = parseParams($src);
                var $mapEl = $this.next();

                $wrapEl.css(opts.wrapperCSS);
                $wrapEl.css({'width' : gMapPars.width, 'height' : gMapPars.height});
                $mapEl.css({'width' : gMapPars.width, 'height' : gMapPars.height});
                    
                $this.click(function() {

                    // init map
                    // GMap2 constructor accepts only a DOM element, no jQuery sugar
                    var map = new GMap2($mapEl.get(0));
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
                
                // load in colorbox
                if (opts.colorbox) {
                    $this.colorbox({inline:true, href:$mapEl.css({'position' : 'static', 'width' : opts.colorbox.width, 'height' : opts.colorbox.height})});
                }

            });

        };

        // private function for debugging
        function debug($obj) {
            if (window.console && window.console.log) {
                window.console.log($obj);
            }
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
            'class' : 'gsdmap'
        },
        wrapperCSS : {
            'position' : 'relative',
            'overflow' : 'hidden',
            'display'  : 'inline-block',
            '*display' : 'inline',
            '*zoom'    : '1'
        },
        mapHolderAttrs : {
            'class' : 'map_holder'
        },
        mapHolderCSS : {
            'position' : 'absolute',
            'left'     : 0,
            'top'      : 0
        },
        colorbox : {
            'width'    : 800,
            'height'   : 600
        }
    };
    

})(jQuery);