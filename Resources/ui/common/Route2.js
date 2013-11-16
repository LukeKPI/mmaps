var UI = require('/ui/common/UI');
var TiMap = (android && Ti.App.GoogleMapsApiV2 ? require('ti.map') : Ti.Map);

module.exports = {
    getPoints : function(coords) {
        var points = [], singlePoint = {};

        var url = 'http://api-maps.yandex.ru/services/route/1.0/route.xml?lang=ru_RU&rll=' + coords[0].lat + ',' + coords[0].lon + '~' + coords[1].lat + ',' + coords[1].lon, xhr = Titanium.Network.createHTTPClient();
        Ti.API.info(url)

        xhr.onload = function(e) {
            Ti.API.info(e.source.responseText)
            //Ti.API.info('asd');
            //Ti.API.info(JSON.parse(e.source.responseText.slice(1,-2)));
            var mapObj = JSON.parse(e.source.responseText.slice(1, -2));
            //Ti.API.info(mapObj);
            //Ti.API.info(mapObj.response.features[1]);
            //Ti.API.info(mapObj.response.features[1].features[0].properties.boundedBy);
            //Ti.API.info(mapObj.response.features[1].features.length);
            Ti.API.info('work')

            var c = 0;
            function rec(arr) {
                var o;
                Ti.API.info('array-' + arr.length)
                for (var i = 0, j = arr.length; i < j; i++) {
                    Ti.API.info('array [' + i + ']');
                    //Ti.API.info(arr[i].properties)
                    if ("properties" in arr[i])
                        if ("boundedBy" in arr[i].properties) {
                            o = arr[i].properties.boundedBy;
                            /*--------------*/
                            for (var m = 0, n = o.length; m < n; m++) {
                                singlePoint = {
                                    latitude : o[m][0],
                                    longitude : o[m][1]
                                }

                                points.push(singlePoint);
                            }
                            /*--------------*/

                            c += 2;
                            Ti.API.info('got one - ' + c);
                        }

                    Ti.API.info('f in arr[' + i + ']');
                    if ("features" in arr[i]) {
                        Ti.API.info('i rec  ' + i)
                        rec(arr[i].features);
                    }
                }
            }

            rec(mapObj.response.features);
            Ti.API.info(points)
            Ti.API.info('finished')

            /*
             for (var i = 0, j = mapObj.response.features[1].features.length; i < j; i++) {

             for (var k = 0; k < 2; k++) {
             //Ti.API.info(i + ' - ' + k)
             singlePoint = {
             latitude : mapObj.response.features[1].features[i].properties.boundedBy[k][0],
             longitude : mapObj.response.features[1].features[i].properties.boundedBy[k][1]
             }
             }

             points.push(singlePoint);
             }*/

            /*
             points.push({
             latitude : 37.422502,
             longitude : -122.0855498
             });*/

            Ti.App.fireEvent('routeReady', {
                points : points
            });
            //Ti.API.info(points);
            /*
             var mapObj = JSON.parse(this.responseText), points = [], steps = mapObj.routes[0].legs[0].steps;

             for (x in steps) {
             if (steps.length > 1) {
             var lat = steps[x].start_location.lat, lon = steps[x].start_location.lng, lat2 = steps[x].end_location.lat, lon2 = steps[x].end_location.lng;

             var startObj = {
             latitude : lat,
             longitude : lon
             }, endObj = {
             latitude : lat2,
             longitude : lon2
             };

             points.push(startObj, endObj);
             }
             }

             var route = {
             name : "bonVoyage",
             points : points,
             color : "blue",
             width : 6
             };

             self.mapView.addRoute(route);*/

        };

        xhr.open('GET', url);
        xhr.send();

        return points;
    }
}

function makeAnnotations(data, map, route, self, topTB, currPos) {
    var annotations = [], routeAnnotations, prevAnnotation, currStationId;
    //currStationId -> for route  -> refreshListWindow

    var time = new Date().getTime();

    //Ti.API.info('anno count - ' + data.length);
    //Ti.API.info('DATA LENGTH - ' + data.length);
    //Ti.API.info('STATION ID - ' + data[0].id);

    for (var i = 0; i < data.length; i++) {
        currStationId = data[i].id;
        //Ti.API.info('currStationId - ' + currStationId)

        var logoView = Ti.UI.createView({
            backgroundImage : '/images/i1_2/logo_station.png',
            width : 41,
            height : 34
        });

        var stationOnMap = TiMap.createAnnotation({
            latitude : data[i].station_lat,
            longitude : data[i].station_long,
            title : data[i].brand,
            subtitle : data[i].addr,
            pincolor : TiMap.ANNOTATION_GREEN,
            stationId : data[i].id,
            stationData : data[i],
            image : '/images/map/pin.png',
            leftView : logoView
        });

        if (android) {
            stationOnMap.image = '/images/map/pin_a.png';
        }

        if (!android) {
            stationOnMap.rightButton = Ti.UI.iPhone.SystemButtonStyle.DONE;
        }

        if (android) {
            map.addEventListener('click', function(e) {
                if (e.clicksource == 'title' || e.clicksource == 'subtitle') {
                    Ti.App.fireEvent('openSingleAZSWindow', {
                        id : e.annotation.stationId,
                        data : e.annotation.stationData
                    });

                    topTB.fireTapViewA();
                }
            });
        } else {
            stationOnMap.addEventListener('click', function callback(e) {
                //Ti.API.info('annotation COORDS - ' + e.annotation.latitude + "/" + e.annotation.longitude);
                if (e.clicksource == 'rightButton') {
                    Ti.App.fireEvent('openSingleAZSWindow', {
                        id : e.annotation.stationId,
                        data : e.annotation.stationData
                    });
                }
            });
        }

        annotations.push(stationOnMap);
    }

    if (route) {
        var refreshFunc = function() {

            if (!Ti.Geolocation.locationServicesEnabled) {
                UI.AlertDialog(L('error_disable_geo'));
                return;
            }

            if (currRoute) {
                map.removeRoute(currRoute);
                map.removeAllAnnotations();
            }

            Ti.Geolocation.getCurrentPosition(function(geo) {

                //Ti.API.info('GEOLOCATION START LW.js')
                //Ti.API.info('SUCESS'+geo.success+' / '+geo.coords);
                if (geo.error) {
                    //Ti.API.info('LOCATION ERROR ON REFRESH BTN EVENT = ' + geo.error);
                    UI.AlertDialog(L('error_disable_geo'));
                    return;
                } else {
                    Ti.API.info('GEO success');
                    var data = {
                        lat : geo.coords.latitude,
                        lon : geo.coords.longitude
                    }
                }
                //Ti.API.info('BEW COORDS - ' + geo.coords.latitude + '/' + geo.coords.longitude);
                Ti.App.Properties.setString('currPosition', JSON.stringify(data));

                Ti.App.fireEvent('returnListWindow', {
                    stationId : currStationId,
                    route : true
                })
            });

        }
        if (!Ti.Geolocation.locationServicesEnabled) {
            UI.AlertDialog(L('error_disable_geo'));
            Ti.App.Properties.setBool('geofailure', true);
            return annotations;
        } else {
            if (!android) {
                Ti.API.info('iOS change coords ');

                if (Ti.App.Properties.getBool('geofailure')) {
                    Ti.API.info('was fake coords');
                    refreshFunc();

                    Ti.App.Properties.setBool('geofailure', false);
                }
            } else {
                //android version
                var result = Ti.Geolocation.getCurrentPosition(function(geo) {
                    if (geo.error) {
                        UI.AlertDialog(L('error_disable_geo'));
                        return false;
                    } else {
                        Ti.API.info('GEO success');
                        var data = {
                            lat : geo.coords.latitude,
                            lon : geo.coords.longitude
                        }
                        Ti.App.Properties.setBool('geofailure', false);
                        Ti.App.Properties.setString('currPosition', JSON.stringify(data));

                        return true;
                    }
                });

                if (!result) {
                    return annotations;
                }
            }
        }
        //XXX
        (function() {
            var instructionsTable, instructionsView, bottomBar;

            if (android) {
                //Android
                var TabbedBar = require('/ui/common/TabbedBar');

                bottomBar = new TabbedBar({
                    bottom : 0,
                    labelA : L('way'),
                    labelB : L('text'),
                    funcA : function(bar, e) {
                        if (e.center) {

                            map.setRegion({
                                latitude : e.center.lat,
                                longitude : e.center.lng,
                                latitudeDelta : e.center.latDelta,
                                longitudeDelta : e.center.lngDelta,
                            });
                        }

                        self.add(map)
                        self.remove(instructionsView);
                    },
                    funcB : function(bar, e) {
                        self.add(instructionsView);
                        self.remove(map);
                    }
                });

                var refreshButton = Ti.UI.createView({
                    backgroundImage : '/images/map/refresh.png',
                    right : 5,
                    width : 24,
                    height : 24
                });

                refreshButton.addEventListener('click', refreshFunc);

                bottomBar.add(refreshButton);
            } else {
                //iOS
                var bottomBarView = Ti.UI.createView({
                    backgroundColor : 'silver',
                    height : 44,
                    width : 'auto',
                    bottom : 0,
                    backgroundImage : '/images/i1_2/bottom_back.png'
                });

                var refreshRouteButton = Ti.UI.createView({
                    backgroundImage : '/images/map/refresh.png',
                    right : 5,
                    width : 24,
                    height : 24
                });

                //XXX
                refreshRouteButton.addEventListener('click', refreshFunc);

                bottomBarView.add(refreshRouteButton);

                bottomBar = Titanium.UI.iOS.createTabbedBar({
                    labels : [L('way'), L('text')],
                    style : Titanium.UI.iPhone.SystemButtonStyle.BAR,
                    index : 0,
                    backgroundColor : '#0c4e8d'
                });

                bottomBar.addEventListener('click', function(e) {
                    if (e.index == 0) {
                        if (e.center) {
                            map.setRegion({
                                latitude : e.center.lat,
                                longitude : e.center.lng,
                                latitudeDelta : e.center.latDelta,
                                longitudeDelta : e.center.lngDelta,
                            });

                            //Ti.API.info('DELTA LONG MUST BE - ' + e.center.lngDelta);
                            //Ti.API.info('IS - ' + map.getLongitudeDelta())

                            bottomBar.index = 0;
                        }
                        UI.replaceView(self, map);
                        instructionsView.remove(bottomBarView);
                        map.add(bottomBarView);
                    } else {
                        UI.replaceView(self, instructionsView);
                        map.remove(bottomBarView);
                        instructionsView.add(bottomBarView);
                    }
                });
            }

            //getPoints
            //Ti.API.info('GET ROUTE POINTS')
            //Ti.API.info('CURR POINTS = ' + currPos.lat)
            var points = Route.getPoints([{
                lat : currPos.lat, //50.454067,
                lon : currPos.lon//30.446162
            }, {
                lat : stationOnMap.latitude, //51.423197,
                lon : stationOnMap.longitude//30.366383
            }]);
            //funcs for event - ready points
            var routeReady = function(e) {
                //Ti.API.info('RouteReady')
                if (e.error) {
                    UI.AlertDialog(e.error);
                    currRoute = {
                        points : [],
                        width : 4,
                        color : '#5a66dc',
                        name : 'route'
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

                //Ti.API.info('------------>ROUTE ' + currRoute)
                map.addRoute(currRoute);

                var middlePoint = getMiddlePoint(currPos.lat, currPos.lon, stationOnMap.latitude, stationOnMap.longitude);
                map.setRegion({
                    latitude : middlePoint.lat,
                    longitude : middlePoint.lng,
                    latitudeDelta : middlePoint.latDelta * 2,
                    longitudeDelta : middlePoint.lngDelta * 2,
                });

                routeAnnotations = makeRouteInstractions(e.instructions, map, self);
                map.addAnnotations(routeAnnotations);

                var tData = [];
                for (var i = 0, j = e.instructions.length; i < j; i++) {

                    var inst = e.instructions[i];

                    var num = i + 1, text = inst.html.replace(/<div.*?>/g, '. ').replace(/<.*?>/g, ''), length = e.instructions[i].length;

                    var row = Ti.UI.createTableViewRow({
                        layout : 'horizontal',
                        hasChild : true
                    });
                    var label = Ti.UI.createLabel({
                        text : num + '. ' + text,
                        font : {
                            fontSize: "11dip"
                        },
                        width : 240,
                        left : 10
                    });

                    var labelLength = Ti.UI.createLabel({
                        text : length,
                        font : {
                            fontSize: "11dip"
                        },
                        width : 40,
                        left : 10,
                        height : 44
                    });

                    if (android) {
                        label.color = "#666";
                        label.width = 220;
                        labelLength.color = "#666";
                    }

                    row.add(label);
                    row.add(labelLength);

                    function getMiddlePoint(x1, y1, x2, y2) {
                        return {
                            lat : (x2 + x1) / 2,
                            lng : (y2 + y1) / 2,
                            latDelta : Math.abs(x1 - x2).toFixed(4),
                            lngDelta : Math.abs(y1 - y2).toFixed(4)
                        };
                    };

                    var middlePoint = getMiddlePoint(inst.startLocation.lat, inst.startLocation.lng, inst.endLocation.lat, inst.endLocation.lng);

                    row.centerOnMap = middlePoint;

                    tData.push(row);
                }

                if (!tData.length) {
                    tData.push(Ti.UI.createTableViewRow({
                        title : L('no_data')
                    }));
                }

                //Ti.API.info('tData - ' + tData)
                if (!tData) {
                    tData.push(Ti.UI.createTableViewRow({
                        layout : 'horizontal',
                        hasChild : true,
                        title : 'no data'
                    }));
                }

                instructionsTable = Ti.UI.createTableView({
                    data : tData,
                    maxRowHeight : 44,
                    minRowHeight : 44,
                    rowHeight : 44,
                    backgroundColor : 'white'
                });

                if (!android) {
                    instructionsTable.bottom = 44;
                }

                instructionsTable.addEventListener('click', function(e) {
                    if (android) {
                        //fire on bar
                        bottomBar.fireTapViewA({
                            center : e.row.centerOnMap
                        });
                    } else {
                        bottomBar.fireEvent('click', {
                            index : 0,
                            center : e.row.centerOnMap
                        });
                    }
                });

                instructionsView = Ti.UI.createView();
                if (android) {
                    instructionsView.bottom = 44;
                }
                instructionsView.add(instructionsTable);
                //Ti.API.info('END_________________________>')
                Ti.App.removeEventListener('routeReady', routeReady);
            };

            Ti.App.addEventListener('routeReady', routeReady);

            //funcs to make route instructions
            function makeRouteInstractions(insts, map, self) {
                //SELF is for android
                var instructions = [], viewHint, timeOut;
                //indexes = array that show where polyline start position in array of all coordinates
                for (var i = 0, j = insts.length; i < j; i++) {
                    var num = i + 1;
                    var instruction = TiMap.createAnnotation({
                        latitude : insts[i].startLocation.lat,
                        longitude : insts[i].startLocation.lng,
                        title : 'точка ' + num,
                    });

                    var showPrompt = function me(e) {
                        var num = me.i;

                        if (viewHint) {
                            clearTimeout(timeOut);
                            map.remove(viewHint);
                        }
                        viewHint = Ti.UI.createView({
                            backgroundColor : 'black',
                            opacity : 0.7,
                            bottom : 44,
                            height : 66,
                            width : Ti.UI.FILL
                        });

                        viewHint.add(Ti.UI.createLabel({
                            left : 10,
                            text : insts[num].html.replace(/<div.*?>/g, '. ').replace(/<.*?>/g, ''),
                            font : {
                                fontSize: "12dip"
                            },
                            color : 'white'
                        }))

                        //XXX NOT TESTED YET
                        if (android) {
                            //self.add(viewHint);
                        } else {
                            map.add(viewHint);
                        };

                        if (android) {
                            var deleteHint = function() {
                                if (viewHint)
                                    self.remove(viewHint);
                            }
                            Ti.App.addEventListener('deleteHint', deleteHint);
                        }

                        timeOut = setTimeout(function(e) {
                            if (android) {
                                //if (viewHint)
                                //    self.remove(viewHint);
                                Ti.App.removeEventListener('deleteHint');
                            } else {
                                if (map)
                                    map.remove(viewHint);
                            }

                            viewHint = null;
                        }, 3000);
                    };
                    showPrompt.i = i;

                    instruction.addEventListener('click', showPrompt);
                    //Ti.API.info(instruction)
                    instructions.push(instruction);
                }

                return instructions;
            }

            if (android) {
                map.bottom = 44;
                map.top = 44;
                self.add(bottomBar);
            } else {
                bottomBarView.add(bottomBar);
                map.add(bottomBarView);
            }
        })();
    }

    time = new Date().getTime() - time;
    Ti.API.info('GetAnnotation - ' + time + ' ms');

    return annotations;
}
