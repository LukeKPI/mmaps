var Data = require('/models/Data');
var Route = require('/ui/common/Route');
var RouteInstructions = require('/ui/common/RouteInstructions');
var _ = require('libs/underscore-min');
var UI = require('/ui/common/UI');
var clusters = [];
var android = (Ti.Platform.osname == 'android') ? 1 : 0;
if (android) {
    //var tm = require('ti.map');
    //Ti.App.GoogleMapsApiV2 = tm.isGoogleMapsInstalled();
    //Ti.API.info(Ti.App.GoogleMapsApiV2);
}
Ti.App.GoogleMapsApiV2 = false;
Ti.Map = (android && Ti.App.GoogleMapsApiV2 ? require('ti.map') : Ti.Map);
if (android) {
    Ti.API.timestamp = function(e){
        Ti.API.info(new Date().getTime() + " " + e);
    }
}

function getMiddlePoint(x1, y1, x2, y2) {
    return {
        lat : (parseFloat(x2) + parseFloat(x1)) / 2,
        lng : (parseFloat(y2) + parseFloat(y1)) / 2,
        latDelta : Math.abs(x1 - x2).toFixed(4),
        lngDelta : Math.abs(y1 - y2).toFixed(4)
    };
};
function MapView(props) {
    var self = Ti.UI.createView({
        backgroundImage : "/images/list_bg.png"
    });
    var ACACHE = {};
    var isStatic = props.isStatic;
    var keysToDelete = {};
    //android = 1;
    var numbergen = Ti.UI.createView({
        left : -1000,
        top : -1000,
        //zIndex: 1000,
        backgroundImage : android ? "/images/map/pin_a_cluster.png" : "/images/map/pin_cluster.png",
        width : android ? "28dp" : 28,
        height : android ? "46dp" : 91
    });
    var nlbl = Ti.UI.createLabel({
        left : android ? "5px" : 5,
        top : android ? "6px" : 7,
        height : "auto",
        right : android ? "5px" : 5,
        textAlign : "center",
        wordWrap : false,
        color : "black",
        font : {
            fontSize : "10dp"
        },
        text : "331",
    });
    //android = 0;
    numbergen.add(nlbl);
    self.add(numbergen);
    var holder = Ti.UI.createView();
    self.add(holder);
    var mode = props.mode;
    var timer;
    var annotations = [];
    var new_annotations = [];
    var delete_annotations = [];
    var keepAnnotationId;
    var lastLoadTime = new Date().getTime();
    
    if (isStatic) {
        var data = Data.models[props.mode].getList({});
        new_annotations = [];
        for (var i = 0; i < data.length; i++) {
            addOneAnnotation(data[i]);
        }
        props.annotations = android ? _.map(new_annotations, function(a) {return Ti.Map.createAnnotation(a)}) : new_annotations;
    }
    var o = {
        mapType : android ? Ti.App.GoogleMapsApiV2 ? Ti.Map.NORMAL_TYPE : Ti.Map.STANDARD_TYPE : Ti.Map.STANDARD_TYPE,
        userLocation: true,
    };
    if (props.annotations) {
        o.annotations = props.annotations;
    }
    Ti.API.info(JSON.stringify(o));
    var mapview = Ti.Map.createView(o);
    o = null;
    Ti.API.info('CREAATED ' + Ti.App.GoogleMapsApiV2);
    
    var routeAnnotation;
    function linkFunction(e) {
        if (!e.clicksource || !e.annotation) return;
        if (e.annotation && e.annotation == routeAnnotation) return;
        if (e.annotation.data && e.annotation.data.cluster) return;
        if (e.clicksource && e.clicksource != 'pin') {
            var event = null;
            if (mode === 'station') {
                event = 'openSingleAZSWindow';
            } else if (mode === 'card_seller') {
                if ((e.clicksource == "leftPane" || e.clicksource == "leftButton") && e.annotation.data.phone) {
                    UI.makePhoneCall(e.annotation.data.phone);
                    return;
                }

                event = 'openSingleKartWindow';
            } else {
                if ((e.clicksource == "leftPane" || e.clicksource == "leftButton") && e.annotation.data.phone) {
                    UI.makePhoneCall(e.annotation.data.phone);
                    return;
                }
                event = 'openSingleOptWindow';
            }

            Ti.App.fireEvent(event, {
                data : JSON.parse(JSON.stringify(e.annotation.data)),
            });
        }
    }

    function removePreparedAnnotations() {
        Ti.API.timestamp('GOING TO REMOVW')
        var for_del = [];
       _.each(keysToDelete, function(del, key) {
           if(del) {
                var a = ACACHE[key];      
                var data = a.data;
                if (data.id != keepAnnotationId) {
                    
                    ACACHE[key] = null;
                    delete ACACHE[key];
                    if (android && !Ti.App.GoogleMapsApiV2) {
                        mapview.removeAnnotation(a);
                    }
                    for_del.push(a);
                }
            }
        });
        Ti.API.timestamp('ENUMERATED');
        if (!android || Ti.App.GoogleMapsApiV2) {
            mapview.removeAnnotations(for_del);
        }
        for_del =[];
        Ti.API.timestamp('REMOVED ' + for_del.length)
    };
    
    function addOneAnnotation(item) {
        if (!item)
            return;
        var key = parseFloat(item.lat).toFixed(5) + "_" +parseFloat(item.lon).toFixed(5) +"_"+(item.cluster?0:1)+"_"+(item.cluster ? item.stations : '');
        if (!isStatic) {
            currStationId = item.id;
            //Ti.API.info(key);
            var found = ACACHE[key];
            if (found) {
                //Ti.API.info('FOUND ' + key);
                delete keysToDelete[key];
                //found.isAnnotation = true;
                return found;
            }
        }
        var aimage;
        if (item.cluster) {
            if (android) {
                aimage = "/images/map/"+item.stations+".png";
            } else {
                var found = clusters[item.stations];
                if (found) {
                    aimage = found;
                } else {
                    nlbl.text = item.stations;
                    aimage = numbergen.toImage(null);
                    if (android) {
                        clusters[item.stations] = aimage.media;
                    } else {
                        clusters[item.stations] = aimage;
                    }
                }
            }
        } else {
            aimage = android ? '/images/map/pin_a.png' : '/images/map/pin.png';
        }
        Ti.API.info(aimage);
        var opt = {
            latitude : item.lat,
            longitude : item.lon,
            title : item.cluster ? item.name : mode == "card_seller" ? item.addr : item.brand,
            subtitle : mode == "card_seller" ? item.phone : item.addr,
            id : item.id,
            data : item,
            image: aimage,
            readyToRemove : false,
            key: key
        };
        if (android) opt.customView = Ti.UI.createImageView({image: aimage});
        if ( !item.cluster ) {
            opt.rightButton = '/images/map/disclosure.png';
        }
        if ( !item.cluster ) {
            if (mode != "station") {
                opt.leftButton = '/images/passport/phone.png';
            } else {
                opt.leftButton = '/images/map/logo_station.png'
            }
        }
        var annotation = opt;
        


        if (!android) {
            annotation.OnClick = linkFunction;
        }

        annotations.push(annotation);
        new_annotations.push(annotation);
        //mapview.addAnnotation(annotation);
    }
    var reloadTimer, loading = false;
    function reloadAnnotations(region) {
        if (isStatic) return;
        
        
        Ti.API.timestamp('START RELOAD')
        keysToDelete = {};
        _.each(ACACHE, function(a, key) {
            keysToDelete[key] = true;
        });
        new_annotations = [];
        //Ti.API.timestamp('GET LIST ' + JSON.stringify(lastRegion));
        var data = Data.models[mode].getListInRect(region);
        Ti.API.timestamp('GOT LIST')
        for (var i = 0; i < data.length; i++) {
            addOneAnnotation(data[i]);
        }
        Ti.API.timestamp('START ADD')
        if (!android) { 
            mapview.addAnnotations(new_annotations);
            var list = mapview.annotations;
            _.each(list, function(a, index, array) {
                var d = a.data;
                if (!d) return;
                var key = parseFloat(d.lat).toFixed(5) + "_" +parseFloat(d.lon).toFixed(5) +"_"+(d.cluster?0:1)+"_"+(d.cluster ? d.stations : '');
                ACACHE[key] = a; 
            });
            Ti.API.timestamp('ENUMERATED_ADDED')
        } else {
            mapview.addAnnotations(_.map(new_annotations, function(a){
                ACACHE[a.key] = Ti.Map.createAnnotation(a);
                return ACACHE[a.key];
            }));
        }
        Ti.API.timestamp('ADDED ' + new_annotations.length)
        removePreparedAnnotations();
        Ti.API.timestamp('END RELOAD')
    };
    //mapview.addEventListener("regionChanged", reloadAnnotationsOnChange);
    var loadingTimer;
    var lastRegion = mapview.region;
    function reloadAnnotationsOnChange(e) {
        Ti.API.info(JSON.stringify(e));
        lastRegion = {
                latitude : e.latitude,
                longitude : e.longitude,
                latitudeDelta : e.latitudeDelta,
                longitudeDelta : e.longitudeDelta,
        };
        //Ti.API.info()
        if (isStatic) return;
        if (loading) return;
        //mapview.removeEventListener("regionChanged", reloadAnnotationsOnChange)
        if (loadingTimer) {
            clearTimeout(loadingTimer);
            loadingTimer = 0;
        }    
        loadingTimer = setTimeout(function(){
            loading = true;
            reloadAnnotations(lastRegion);
            Ti.API.info()
            loading = false;
        }, 1000);
        //mapview.addEventListener("regionChanged", reloadAnnotationsOnChange)
    }


    self.setRegion = function(e) {
        mapview.setRegion(e);
    }

    function initGeoPosition(e){
        if (e.error) {
            UI.showGeoAlert();
        } else {
            mapview.setRegion({
                latitude : e.coords.latitude,
                longitude : e.coords.longitude,
                latitudeDelta : 0.05,
                longitudeDelta : 0.07,
            });
        }
    }
    
    function activeAnnotation(station) {
        mapview.removeEventListener('click', linkFunction);
        mapview.removeEventListener("regionchanged", reloadAnnotationsOnChange);
        if (station) {
            Ti.API.info('SET REGION')
            mapview.setRegion({
                latitude : station.lat,
                longitude : station.lon,
                latitudeDelta : 0.05,
                longitudeDelta : 0.07,
            });
            Ti.API.info('RELOAD ANN');
            keepAnnotationId = station.id;
            reloadAnnotations({
                latitude : parseFloat(station.lat),
                longitude : parseFloat(station.lon),
                latitudeDelta : 0.05,
                longitudeDelta : 0.07,
            });
            var a = addOneAnnotation(station);
            if (!a) {
                a = Ti.Map.createAnnotation(new_annotations[0]);
                mapview.addAnnotation(a);
            }
            setTimeout(function() {
                mapview.selectAnnotation(a);
                mapview.addEventListener("regionchanged", reloadAnnotationsOnChange);
                mapview.addEventListener('click', linkFunction);
                mapview.addEventListener("longpress", longPress);
            }, 500);
        } else {
            keepAnnotationId = false;
            mapview.addEventListener("regionchanged", reloadAnnotationsOnChange);
            mapview.addEventListener('click', linkFunction);
            mapview.addEventListener("longpress", longPress);
            Ti.Geolocation.getCurrentPosition(initGeoPosition);
        }
    }

    this.activeAnnotation = activeAnnotation;
    holder.add(mapview);

    //ROUTING
    var currRoute, importedDestination;
    function drawRoute(destination, custom) {
        if (!Ti.Geolocation.locationServicesEnabled) {
            UI.AlertDialog(L('error_disable_geo'));
            return;
        }

        if (currRoute) {
            mapview.removeRoute(currRoute);
        }
        if (routeAnnotation && !custom) {
            mapview.removeAnnotation(routeAnnotation);
            routeAnnotation = null;
        }
        //mapview.removeAllAnnotations();

        Ti.Geolocation.getCurrentPosition(function(geo) {
            if (geo.error) {
                UI.AlertDialog(L('error_disable_geo'));
                return;
            } else {
                Ti.API.info('GEO success');
                var currPos = {
                    lat : geo.coords.latitude,
                    lon : geo.coords.longitude
                }
            }
            //Ti.API.info('BEW COORDS - ' + geo.coords.latitude + '/' + geo.coords.longitude);
            Ti.App.Properties.setString('currPosition', JSON.stringify(currPos));
            Ti.App.currPosition = currPos;

            importedDestination = destination;
            var points = Route.getPoints([{
                lat : currPos.lat, //50.454067,
                lon : currPos.lon//30.446162
            }, {
                lat : destination.latitude, //51.423197,
                lon : destination.longitude//30.366383
            }], function(e) {
                self.routeReady(e, mapview, currPos, destination)
            });
        });
    };
    
    this.drawRoute = drawRoute;
    self.routeReady = function(e, mapview, currPos, destination) {
        //ROUTE

        //Ti.API.info('RouteReady')
        if (e.error) {
            UI.AlertDialog(e.error);
            currRoute = {
                points : []
            };
            e.instructions = [];
        } else {
            currRoute = {
                points : e.points,
                width : 4,
                color : '#5a66dc',
                name : 'route'
            };
        }
        
        currRoute = android && Ti.App.GoogleMapsApiV2 ? Ti.Map.createRoute(currRoute) : currRoute;
        mapview.addRoute(currRoute);
        Ti.API.info(currPos, destination);
        var middlePoint = getMiddlePoint(currPos.lat, currPos.lon, destination.latitude, destination.longitude);
        Ti.API.info(middlePoint);
        mapview.setRegion({
            latitude : middlePoint.lat,
            longitude : middlePoint.lng,
            latitudeDelta : middlePoint.latDelta * 2,
            longitudeDelta : middlePoint.lngDelta * 2,
        });

        //ROUTE INSTRUCTIONS
        //routeAnnotations = makeRouteInstractions(e.instructions, map, self);

        //mapview.addAnnotations(routeAnnotations);
        routeInstructions.fireEvent("fill", {
            instructions : e.instructions
        });
        self.add(bottomBar);
        //self.add(routeInstructions);
        holder.bottom = 44;
    }
    var bottomBar = UI.WindowFooter({
        button_bar : [L('way'), L('text')],
        left_button : true,
        right_button : true
    });

    bottomBar.addEventListener('leftBtnTap', function(e) {
        mapview.removeRoute(currRoute);
        if (routeAnnotation) {
            mapview.removeAnnotation(routeAnnotation);
            routeAnnotation = null;
        }
        self.remove(bottomBar);
        holder.bottom = 0;
        if (viewmode == "route") {
            UI.replaceView(holder, mapview, 1);
        }
    });
    
    function reDrawRoute(){
        drawRoute(importedDestination);
    }
    bottomBar.addEventListener('rightBtnTap', reDrawRoute);

    bottomBar.addEventListener('changeMode', function(e) {
        if (e.index == 1) {
            bottomBar.buttonBarIndex(1);
            viewmode = "route";
            UI.replaceView(holder, routeInstructions);
        } else {
            viewmode = "map";
            bottomBar.buttonBarIndex(0);
            UI.replaceView(holder, mapview);
        }
    });

    var routeInstructions = RouteInstructions({
        //visible: false
    });

    routeInstructions.addEventListener("routeSelected", function(e) {
        mapview.setRegion({
            latitude : e.center.lat,
            longitude : e.center.lng,
            latitudeDelta : e.center.latDelta * 1.2,
            longitudeDelta : e.center.lngDelta * 1.2,
        });
        viewmode = "map";
        UI.replaceView(holder, mapview);
        bottomBar.buttonBarIndex(0);
    });
    //self.drawRoute.mapview = mapview;
    var viewmode = "map";
    
    this.cleanup = function() {
        ACACHE = {};
        for (var i=0; i < new_annotations; i++) {
            new_annotations[i] = null;
        };
        new_annotations = [];
        props = null;
//        o = null
        mapview.removeEventListener('click', linkFunction);
        mapview.removeEventListener("regionChanged", reloadAnnotationsOnChange);
        mapview.removeAllAnnotations();
        Ti.API.info('CLEAN MAPVIEW');

        mapview.clean();
        return;
        Ti.API.info('REMOVE MAP VIEW');
        self.activeAnnotation = null;
        self.drawRoute = null;
        self.setRegion = null;
        self.drawRoute = null;
        self.routeReady = null;
        holder.remove(mapview);
        mapview = null;
        Ti.API.info('NULL MAP VIEW');
        self.removeAllChildren();
        props = null;
    } 
    self.isMapView = true;
    //return self;
    this.getView = function(){return self};
    
    var calculateLatLngfromPixels = function(mapview, xPixels, yPixels) {
    
        var region = lastRegion || mapview.region;
        Ti.API.info(region);
        var widthInPixels = mapview.rect.width;
        var heightInPixels = mapview.rect.height;
    
        // should invert because of the pixel reference frame
        heightDegPerPixel = -region.latitudeDelta / heightInPixels; 
        widthDegPerPixel = region.longitudeDelta / widthInPixels;
    
        return {
            latitude : (yPixels - heightInPixels / 2) * heightDegPerPixel + parseFloat(region.latitude),
            longitude : (xPixels - widthInPixels / 2) * widthDegPerPixel + parseFloat(region.longitude)
    
        };
    }    
    function longPress(e) {
        var c = calculateLatLngfromPixels(mapview, e.x, e.y);
        if (routeAnnotation) {
            mapview.removeAnnotation(routeAnnotation);
            routeAnnotation = null;
        }
        routeAnnotation = Titanium.Map.createAnnotation({
            pincolor : Titanium.Map.ANNOTATION_GREEN,
            animate : true,
            title : 'Маршрут',
            latitude : c.latitude,
            longitude : c.longitude
        });
        mapview.addAnnotation(routeAnnotation);
        UI.ConfirmDialog(L("route_confirm"), "Маршрут", function(e) {
            drawRoute(c,1);
        }, function(){
            mapview.removeAnnotation(routeAnnotation);
            routeAnnotation = null;
        });
        
   }
}
module.exports = {
    //makeAnnotations : makeAnnotations,
    MapView : MapView,
    //drawRoute : drawRoute
};
