;(function($) {

    // gsdMaps plugin removes 'Static' from Google Static Maps!
    $.fn.gsdMaps = function(options) {

        var opts = $.extend(true, {}, $.fn.gsdMaps.defaults, options),
            $self = this,
            // extract parameters from the first <img> encountered;
            // we need the API key
            g = extractParams($self.attr('src'));

        if (g.key) {
            // load the Google Maps JavaScript and call init
            $.getScript('http://maps.google.com/maps?file=api&v=2&key='+g.key+'&async=2&callback=jQuery.fn.gsdMaps.init');
        }

        // Main function - create dynamic map from static
        $.fn.gsdMaps.init = function() {

            // create our map-holding div
            var $wrapper = $('<div />').attr(opts.wrapperAttrs);

            $self.each(function() {
                var $this = $(this);
                var $src = $this.attr('src');
                $this.wrap($wrapper);
                $this.css({'cursor' : 'pointer'});

                $this.click(function() {
                
                    var gMapPars = parseParams($src);
                    var mapEl = $this.parent();
                    
                    if (opts.wrapperCSS.width && opts.wrapperCSS.height) {
                        mapEl.css(opts.wrapperCSS);
                    } else {
                        mapEl.css({'width' : gMapPars.width, 'height' : gMapPars.height});
                    }
                    $this.css({'opacity' : '0.3'});
                    
                    // GMap2 constructor accepts only a DOM element, no jQuery sugar
                    //var mapEl = $this.parent().get(0);
                    //$(mapEl).css({'width' : gMapPars.width, 'height' : gMapPars.height});

                    // init map
                    var map = new GMap2(mapEl.get(0));
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
                $this.colorbox({inline:true, href:$this.parent()});

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

        // this is the main return - a reference to the wrapping <div>
        // now you can chain stuff...
        //debug(this);
        //return $self;

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
            '*zoom'    : '1',
            'width'    : 800,
            'height'   : 600
        }
    };
    

})(jQuery);