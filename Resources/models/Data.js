var full_data;
var rashod_data;
var _ = require('libs/underscore-min');
var osname = Ti.Platform.osname, version = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth;
var android = (Ti.Platform.osname == 'android') ? 1 : 0;
var isTablet = osname === 'ipad' || (osname === 'android' && (px2dip(width) >= 600 && px2dip(height) >= 600));

function px2dip(ThePixels) {
    return android ? (ThePixels / (Titanium.Platform.displayCaps.dpi / 160)) : ThePixels;
};

var pageSize = 20;

function distance(pos1, pos2) {
    var lat1 = parseFloat(pos1.lat);
    var lat2 = parseFloat(pos2.lat+".0");
    var lon1 = parseFloat(pos1.lon);
    var lon2 = parseFloat(pos2.lon);

    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var radlon1 = Math.PI * lon1 / 180;
    var radlon2 = Math.PI * lon2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    return dist;
}

module.exports = {
    models : {
        station : {
            getListInRect : function(e) {
                //Ti.API.timestamp('S1');
                Ti.API.info("GOT " + JSON.stringify(e));
                var limit = isTablet ? 80 : android ? 40 : 40;
                var lt1 = (e.latitude - e.latitudeDelta/2);
                var lt2 = (parseFloat(e.latitude) + e.latitudeDelta/2);
                var ln1 = (e.longitude - e.longitudeDelta/2);
                var ln2 = (parseFloat(e.longitude) + e.longitudeDelta/2);
                var found_stations =_.filter(full_data.stations, function(station, index, array) {
                    return station && station.lon && station.lat && station.lat >= lt1 && station.lat <= lt2 && station.lon >= ln1 && station.lon <= ln2;
                });
                if (found_stations.length < limit) return found_stations;
                if (e.longitudeDelta < 3.8) {
                    var region = _.filter(full_data.areas, function(station, index, array) {
                        array[index].cluster = true;
                        return station && station.stations > 0 &&  station.lon && station.lat && station.lat >= lt1 && station.lat <= lt2 && station.lon >= ln1 && station.lon <= ln2;
                    });
                    var result = _.map(region, function(r, index) {
                        if (r.stations == 1) {
                            var fs = _.find(found_stations, function(s) {
                                return s.area_id == r.id;
                            });
                            if (fs) {
                                return fs;
                            }
                        } else {
                            return r;
                        }
                    });
                    return result;
                } 
                
                var region = _.filter(full_data.regions, function(station, index, array) {
                    array[index].cluster = true;
                    return station &&  station.lon && station.lat && station.lat >= lt1 && station.lat <= lt2 && station.lon >= ln1 && station.lon <= ln2;
                });
                return region;
            },

            getList : function(params) {
                //full_data.stations
                //
                var time = new Date().getTime();
                if (!params)
                    params = {};
                
                Ti.API.info("START CALC DIST");
                var currPos = _.clone(Ti.App.currPosition);
                Ti.API.info(currPos);
                
                full_data.stations.forEach(function(station, index, theArray) {
                    theArray[index].distance = distance(station, currPos);
                });

                var result = full_data.stations;
                if (params && params.fuels) {
                    var fuels = params.fuels;
                    result = _.filter(result, function(station) {
                        for (var i = 0; i < fuels.length; i++) {
                            if (station[fuels[i]])
                                return true;
                        }
                        return false;
                    });
                }

                if (params.areaId || params.areaId == 0) {
                    result = _.filter(result, function(station) {
                        return (station.area_id == params.areaId );
                    });
                } else {
                    if (params.regionId || params.regionId == 0) {
                        result = _.filter(result, function(station) {
                            return (station.region_id == params.regionId );
                        });
                    }
                }
                var list = _.sortBy(result, "distance");
                Ti.API.info('CALC IN ' + (new Date().getTime() - time));
                return list;
            }
        },

        region : {
            findOneById : function(id) {
                var result = _.find(full_data.regions, function(rec) {
                    return rec.id == id
                });
                return result;
            },
            getList : function(callback) {
                var result = full_data.regions.filter(function(rec) {
                    return rec.id > 0
                });
                return _.sortBy(result, "name");

            }
        },

        area : {
            getListByRegion : function(regionId) {
                var result = full_data.areas.filter(function(rec) {
                    return rec.region_id == regionId
                });
                return _.sortBy(result, "name");
            }
        },

        fuel : {
            getList : function() {
                var data = full_data.fuels;
                data.sort(function(a, b) {
                    return a.sort_order - b.sort_order
                });
                var fuelsData = {};
                for (var i = 0, j = data.length; i < j; i++) {
                    fuelsData[data[i].id] = data[i];
                }
                return [data, fuelsData];
            },
            getHash : function() {
                var data = full_data.fuels;
                data.sort(function(a, b) {
                    return a.sort_order - b.sort_order
                });
                var fuelsData = {};
                for (var i = 0, j = data.length; i < j; i++) {
                    fuelsData[data[i].code] = data[i];
                }
                return fuelsData;
            },
            getCodeByName : function(fName) {
                var result = _.find(full_data.fuels, function(rec) {
                    return rec.name == fName
                }); 
                
                return result.code;
            }
        },

        card_seller : {
            getListInRect : function(e) {
                //Ti.API.timestamp('S1');
                var limit = 40;
                var ltY = (e.latitude - e.latitudeDelta / 2);
                var ltX = (e.longitude - e.longitudeDelta / 2);
                var region = _.filter(full_data.card_sellers, function(card_seller, index, array) {
                    array[index].cluster = false;
                    return card_seller && card_seller.lon && card_seller.lat && card_seller.lat >= e.latitude - e.latitudeDelta / 2 && card_seller.lat <= e.latitude + e.latitudeDelta / 2 && card_seller.lon >= e.longitude - e.longitudeDelta / 2 && card_seller.lon <= e.longitude + e.longitudeDelta / 2;
                });
                return region;
                var xt = 5, yt = 7;
                //49 tiles on map
                if (region.length <= limit)
                    return region;
                var result = [];
                Ti.API.info(region.length);
                for (var x = -1; x <= xt; x++) {
                    for (var y = -1; y <= yt; y++) {
                        //tile by tile
                        var minC = 9999999, found;
                        var cx1 = ltX + (e.longitudeDelta / xt) * x;
                        var cx2 = cx1 + (e.longitudeDelta / xt);
                        var cy1 = ltY + (e.latitudeDelta / yt) * y;
                        var cy2 = cy1 + (e.latitudeDelta / yt);

                        var center = {
                            lat : (cx1 + cx2) / 2,
                            lon : (cy1 + cy2) / 2
                        };
                        var list = _.filter(region, function(card_seller, index, array) {
                            var yes = card_seller && card_seller.lon && card_seller.lat && card_seller.lat >= cy1 && card_seller.lat <= cy2 && card_seller.lon >= cx1 && card_seller.lon <= cx2;
                            if (yes) {
                                var dist = distance(card_seller, {
                                    lon : (cx1 + cx2) / 2,
                                    lat : (cy1 + cy2) / 2
                                });
                                if (dist < minC) {
                                    minC = dist;
                                    found = card_seller;
                                }
                            }
                            return yes;
                        });
                        //Ti.API.info("tile " + x + " " + y + " : " + list.length);
                        if (list.length == 1) {
                            result.push(list[0]);
                        } else if (list.length > 1) {
                            found.cluster = true;
                            found.stations = list.length;
                            result.push(found);
                        }
                        //>>>>>>> data refactoring + map clustering
                    }
                };
                //Ti.API.timestamp('S2');
                return result;
            },
            getList : function(params) {
                //Ti.API.timestamp('START LIST');
                if (!params)
                    params = {};
                var result = full_data.card_sellers;
                if (params.sellerId || params.sellerId == 0) {
                    return result.filter(function(obj) {
                        return obj.id == params.sellerId
                    });
                }
               var currPos = Ti.App.currPosition;

                result.forEach(function(card_seller, index, theArray) {
                    theArray[index].distance = distance(card_seller, currPos);
                });

                if (params.regionId || params.regionId == 0) {
                    result = result.filter(function(obj) {
                        return obj.region_id == params.regionId
                    })
                }
                return _.sortBy(result, "distance");
                return result;
            }
        },

        wholesaler : {
            getListInRect : function(e) {
                //Ti.API.timestamp('S1');
                var limit = 40;
                var ltY = (e.latitude - e.latitudeDelta / 2);
                var ltX = (e.longitude - e.longitudeDelta / 2);
                var region = _.filter(full_data.wholesalers, function(wholesaler, index, array) {
                    array[index].cluster = false;
                    return wholesaler && wholesaler.lon && wholesaler.lat && wholesaler.lat >= e.latitude - e.latitudeDelta / 2 && wholesaler.lat <= e.latitude + e.latitudeDelta / 2 && wholesaler.lon >= e.longitude - e.longitudeDelta / 2 && wholesaler.lon <= e.longitude + e.longitudeDelta / 2;
                });
                return region;
                var xt = 5, yt = 7;
                //49 tiles on map
                if (region.length <= limit)
                    return region;
                var result = [];
                Ti.API.info(region.length);
                for (var x = -1; x <= xt; x++) {
                    for (var y = -1; y <= yt; y++) {
                        //tile by tile
                        var minC = 9999999, found;
                        var cx1 = ltX + (e.longitudeDelta / xt) * x;
                        var cx2 = cx1 + (e.longitudeDelta / xt);
                        var cy1 = ltY + (e.latitudeDelta / yt) * y;
                        var cy2 = cy1 + (e.latitudeDelta / yt);

                        var center = {
                            lat : (cx1 + cx2) / 2,
                            lon : (cy1 + cy2) / 2
                        };
                        var list = _.filter(region, function(wholesaler, index, array) {
                            var yes = wholesaler && wholesaler.lon && wholesaler.lat && wholesaler.lat >= cy1 && wholesaler.lat <= cy2 && wholesaler.lon >= cx1 && wholesaler.lon <= cx2;
                            if (yes) {
                                var dist = distance(wholesaler, {
                                    lon : (cx1 + cx2) / 2,
                                    lat : (cy1 + cy2) / 2
                                });
                                if (dist < minC) {
                                    minC = dist;
                                    found = wholesaler;
                                }
                            }
                            return yes;
                        });
                        //Ti.API.info("tile " + x + " " + y + " : " + list.length);
                        if (list.length == 1) {
                            result.push(list[0]);
                        } else if (list.length > 1) {
                            found.cluster = true;
                            found.stations = list.length;
                            result.push(found);
                        }
                        //>>>>>>> data refactoring + map clustering
                    }
                };
                //Ti.API.timestamp('S2');
                return result;
            },
            getList : function(params) {
                if (!params)
                    params = {};
                var result = full_data.wholesalers;

                if (params.wholesalerId || params.wholesalerId == 0) {
                    return result.filter(function(obj) {
                        return obj.id == params.wholesalerId
                    });
                }
                var currPos = Ti.App.currPosition;

                result.forEach(function(wholesaler, index, theArray) {
                    theArray[index].distance = distance(wholesaler, currPos);
                });

                if (params.regionId || params.regionId == 0) {
                    result = result.filter(function(obj) {
                        return obj.region_id == params.regionId
                    })
                }
                return _.sortBy(result, "distance");
            }
            
        }
    },
    updateAll : function(callback) {
        var url = 'http://avias.colocall.com/web/api/get_all';
        var self = this;
        var xhr = Ti.Network.createHTTPClient({
            onload : function(e) {
                var success = false;
                Ti.API.info('LOADED');
                try {
                    full_data = JSON.parse(e.source.responseText);
                    Ti.API.info('PARSED');
                    success = true;
                } catch (e) {
                    //alert(L('error_load_data_from_server'));
                    success = false;
                }
                if (success) {
                    Ti.API.info('SAVE');
                    self.saveCurrentData();
                    Ti.API.info('SAVED');
                    callback(true);
                    Ti.API.info('CALLBACHED');
                }
            },
            onerror : function(e) {
                //alert(L('error_load_data_from_server'));
            }
        });
        xhr.open('GET', url);
        xhr.send();
        Ti.API.info('REQUESTED');
    },
    
    saveCurrentData : function() {
        Ti.API.info(Ti.Filesystem.applicationCacheDirectory + "data.json");
        var file = Ti.Filesystem.getFile( Ti.Filesystem.applicationCacheDirectory + "data.json" );
        var str = JSON.stringify(full_data);
        file.write(str);
    },
    readDefaultData : function() {
        var file = Ti.Filesystem.getFile( Ti.Filesystem.resourcesDirectory + "db/data.json" );
        Ti.API.info(Ti.Filesystem.applicationDirectory + "db/data.json");
        full_data = JSON.parse(file.read());
        file = null;
    },
    readData : function() {
        var readedV3 = Ti.App.Properties.getBool("readedV3", false);
        if (!readedV3) {
            Ti.API.info('REFRESH DATA');
            this.readDefaultData();
            this.saveCurrentData();
            Ti.App.Properties.setBool("readedV3", true);
            return;
        }
        var file = Ti.Filesystem.getFile( Ti.Filesystem.applicationCacheDirectory + "data.json" );
        if (file.exists()) {
            try {
                Ti.API.info('READ LAST DATA');
                var txt = file.read().text;
                Ti.API.info('READ LAST DATA1');
                full_data = JSON.parse(txt);
                Ti.API.info('READ LAST DATA2');
                return;
            } catch (e) {
                alert('Error reading station list. Reinstall application');
            }
        }
        this.readDefaultData();
    },
    checkUpdates : function(callback) {
        var url = 'http://avias.colocall.com/web/api/status';
        var self = this;
        var xhr = Ti.Network.createHTTPClient({
            onload : function(e) {
                var success = false;
                try {
                    Ti.API.info('LOADED');
                    var status = JSON.parse(e.source.responseText);
                    success = true;
                } catch (e) {
                    success = false;
                }
                if (success) {
                    Ti.API.info(status);
                    Ti.API.info(full_data.status);
                    if (! _.isEqual(status, full_data.status)) {
                        self.requestUpdates(callback);
                    } else {
                        Ti.API.info('NO CHANgeS');
                        callback(false, L('no_changes'));
                    }
                    //full_data.status
                }
            },
            onerror : function(e) {
                //alert(L('error_load_data_from_server'));
            }
        });
        xhr.open('GET', url);
        xhr.send();
        Ti.API.info('REQUESTED');
        
    },
            //'{station_version}/{region_version}/{card_seller_version}/{wholesaler_version}/{fuel_version}/{area_version}/{service_version}
    requestUpdates : function(callback) {
        var url = 'http://avias.colocall.com/web/api/update/';
        var s = full_data.status;
        var str = s.station + "/" +s.region + "/" +s.card_seller + "/" + s.wholesaler +"/" + s.fuel +"/" +s.area +"/"+s.service;
        url += str;
        Ti.API.info(url);
        var self = this;
        var xhr = Ti.Network.createHTTPClient({
            onload : function(e) {
                var success = false;
                try {
                    var data = JSON.parse(e.source.responseText);
                    full_data = _.extend(full_data, data);
                    success = true;
                } catch (e) {
                    success = false;
                }
                if (success) {
                    Ti.API.info('SAVE');
                    self.saveCurrentData();
                    Ti.API.info('SAVED');
                    callback(true);
                    Ti.API.info('CALLBACHED');
                }
            },
            onerror : function(e) {
                //alert(L('error_load_data_from_server'));
            }
        });
        xhr.open('GET', url);
        xhr.send();
        Ti.API.info('REQUESTED');
        
    },
    getRegionStringList : function(id) {
        var region = this.models.region.findOneById(id);
        //Ti.API.info(region);
        var f = this.models.fuel.getList();
        var fuels = f[0];
        var s = region.name + " :     ";
        fuels.forEach(function(f,i) {
           // Ti.API.info(f.code);
           if (region[f.code]) {
                s += f.name + " - " + parseFloat(region[f.code]).toFixed(2) + "грн.    ";
            }
        });
        return s+s;
    },
    
    saveRashodData : function(data) {
        var file = Ti.Filesystem.getFile( Ti.Filesystem.applicationDataDirectory + "rashod.json" );
        var str = JSON.stringify(data);
        file.write(str);
    },
    readDefaultRashodData : function() {
        var file = Ti.Filesystem.getFile( Ti.Filesystem.resourcesDirectory + "db/rashod.json" );
        return JSON.parse(file.read());
    },
    readRashodData : function() {
        var file = Ti.Filesystem.getFile( Ti.Filesystem.applicationDataDirectory + "rashod.json" );
        if (file.exists()) {
            try {
                Ti.API.info('READ LAST DATA');
                var txt = file.read().text;
                Ti.API.info(txt);
                return JSON.parse(txt);
            } catch (e) {
                return this.readDefaultRashodData();
            }
        }
        return this.readDefaultRashodData();
    },
    updateRashodRecord : function(rec) {
        Ti.API.info('UPDATE RECORD ');
        Ti.API.info(rec);
        var list = this.readRashodData();
        var index = -1;
        var found = _.find(list, function(el, i, array) {
            if (el.id == rec.id) {
                index = i;
                array[i] = rec;
                return true;
            }
            return false;
        });
        if (found) {
            this.saveRashodData(list);
        }
        return list;
    },
    addRashodRecord : function(rec) {
        Ti.API.info('ADD RECORD ');
        Ti.API.info(rec);
        var list = this.readRashodData();
        Ti.API.info(list);
        var mrec = _.max(list, function(el){ return el.id; });
        Ti.API.info(mrec);
        rec.id = list.length == 0 ? 1 : parseInt(mrec.id) + 1;
        Ti.API.info(rec); 
        list.push(rec);
        this.saveRashodData(list);
        return list;
    },
    deleteRashodRecord : function(id) {
        var list = this.readRashodData();
        var index = -1;
        var found = _.find(list, function(el, i) {
            if (el.id == id) {
                index = i;
                return true;
            }
            return false;
        });
        if (index > -1) {
            list.splice(index,1);
        }
        this.saveRashodData(list);
        return list;
    },
    
    getStationById : function(id, callback) {
        var url = 'http://avias.colocall.com/web/api/station_prices/' + id;
        var self = this;
        var result;
        var xhr = Ti.Network.createHTTPClient({
            onload : function(e) {
                try {
                    var result = JSON.parse(e.source.responseText);
                    success = true;
                } catch (ee) {
                    success = false;
                }
                if (success) {
                    callback(true, result);
                }
            },
            onerror : function(e) {
                //alert(L('error_load_data_from_server'));
            }
        });
        xhr.open('GET', url);
        xhr.send();
        Ti.API.info('REQUESTED');
    },
    
    getRegionById : function(id, callback) {
        var url = 'http://avias.colocall.com/web/api/regions/' + id;
        var self = this;
        var result;
        var xhr = Ti.Network.createHTTPClient({
            onload : function(e) {
                try {
                    var result = JSON.parse(e.source.responseText);
                    success = true;
                } catch (ee) {
                    success = false;
                }
                if (success) {
                    callback(true, result);
                }
            },
            onerror : function(e) {
                //alert(L('error_load_data_from_server'));
            }
        });
        xhr.open('GET', url);
        xhr.send();
        Ti.API.info('REQUESTED');
    },
    
    
} 
