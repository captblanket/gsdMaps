var gsdMaps = {

    init: function(src) {
        gMapPars = this.parseParams(src);
        //console.dir(gMapPars);
        this.loadScript();
    },
    
    loadScript: function() {
        var script = $('<script />');
        script.attr('type', 'text/javascript');
        script.attr('src', 'http://maps.google.com/maps?file=api&v=2&key='+gMapPars.key+'&async=2&callback=gsdMaps.loadMap');
        script.appendTo('body');
    },
    
    extractParams: function(src) {
        var paramStr = src.split('?')[1];
        var params = paramStr.split('&');
        var paramHash = [];
        $.each(params, function(i, val) {
            var keyVal = val.split('=');
            paramHash[keyVal[0]] = keyVal[1];
        });
        return paramHash;
    },
    
    parseParams: function(src) {
        var gMapParams = gsdMaps.extractParams(src);
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
                                    // lat
                                    markerArr.latitude = parseFloat(val);
                                break;
                                case 1:
                                    // long
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
    },
    
    loadMap: function() {
        var mapEl = $('#map').get(0);
        
        var map = new GMap2(mapEl);
        map.setCenter(new GLatLng(gMapPars.latitude, gMapPars.longitude), gMapPars.zoom);
        for (var i=0; i<gMapPars.markers.length; i++) {
            map.addOverlay(new GMarker(new GLatLng(gMapPars.markers[i].latitude, gMapPars.markers[i].longitude)));
        }
        var mapControl = new GMapTypeControl();
        map.addControl(mapControl);
        map.addControl(new GLargeMapControl3D());
    }
    
};

$(document).ready(function() {
    var img = $('img.static');
    img.wrap('<div class="gMap"></div>');
    img.click(function(){
        var src = $(this).attr('src');
        gsdMaps.init(src);
        return false;
    });
});