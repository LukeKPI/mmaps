var Data = require('/models/Data');
var models = Data.models;
var MapView = require('/ui/common/MapView').MapView;
var UI = require('/ui/common/UI');
var _ = require('libs/underscore-min');

var android = (Ti.Platform.osname == 'android') ? 1 : 0, mapGeneralRegion;
//oneGeoEventAdd - for one time adding
var rowHeight = UI.isTablet ? 99 : 66, rowLimit = android ? 20 : 20;
var rowCache = {};


var rowTemplate = {
    properties : {
        height : rowHeight,
        backgroundImage : '/images/list_item_bg.png',

    },
    childTemplates : [{
        type : "Ti.UI.Label",
        bindId : 'distance',
        properties : {
            right : 24,
            font : {
                fontSize : UI.isTablet ? "14dp" : "9dip",
                fontWeight : 'bold',
            },
            color : '#2e70ae',
            touchEnabled : false
        }
    }, {
        type : "Ti.UI.ImageView",
        bindId : "logo",
        properties : {
            image : '/images/ra common/station_logo.png',
            width : 66,
            height : 66,
            left : 0,
            className : "station_logo",
            touchEnabled : false
        }
    }, {
        type : "Ti.UI.ImageView",
        properties : {
            image : '/images/ra common/hasChild.png',
            width : 10,
            height : 20,
            right : 11,
            className : "hc",
            touchEnabled : false
        }
    }, {
        type : "Ti.UI.Label",
        bindId : "brand",
        properties : {
            font : {
                fontSize : UI.isTablet ? "20dp" : "14dip",
                fontWeight : 'bold',
            },
            top : "17%",
            left : 66,
            right : 44,
            wordWrap : false,
            color : '#0a4882',
            className : "title",
            touchEnabled : false
        }
    }, {
        type : "Ti.UI.Label",
        bindId : "addr",
        properties : {
            bottom : "16%",
            left : 66,
            right : 44,
            wordWrap : false,
            height : UI.isTablet ? "18dp" : "14dip",
            color : '#666666',
            font : {
                fontSize : UI.isTablet ? "15dp" : "11dip",
            },
            className : "subtitle",
            touchEnabled : false
        }
    }]
};


function createRow(station, vr) {
        var row = Ti.UI.createView({
            stationId : station.id,
            stationData : station,
            height : rowHeight,
            className: "row",
            backgroundImage : '/images/list_item_bg.png',

        });

        row.add(Ti.UI.createLabel({
            right : 24,
            text : station.distance.toFixed(1) + ' км',
            font : {
                fontSize : UI.isTablet ? "14dp" : "9dip",
                fontWeight : 'bold',
            },
            color : '#2e70ae',
            className: "distance",
            touchEnabled : false
        }));

        row.add(Ti.UI.createImageView({
            image : '/images/ra common/station_logo.png',
            width : 66,
            height : 66,
            left : 0,
            className: "station_logo",
            touchEnabled : false
        }));

        row.add(Ti.UI.createImageView({
            image : '/images/ra common/hasChild.png',
            width : 10,
            height : 20,
            right : 11,
            className: "hc",
            touchEnabled : false
        }));

        row.add(Ti.UI.createLabel({
            text : station.brand,
            font : {
                fontSize : UI.isTablet ? "20dp" : "14dip",
                fontWeight : 'bold',
            },
            top : "17%",
            //height : 16,
            left : 66,
            right : 44,
            wordWrap: false,
            color : '#0a4882',
            className: "title",
            touchEnabled : false
        }));

        row.add(Ti.UI.createLabel({
            bottom : "16%",
            text : station.addr,
            left : 66,
            right : 44,
            wordWrap: false,
            height : UI.isTablet ? "18dp" : "14dip",
            color : '#666666',
            font : {
                fontSize : UI.isTablet ? "15dp" : "11dip",
            },
            className: "subtitle",
            touchEnabled : false
        }));

        return row;
   // }
}

function makeTableData(data, table, container, limit, callback) {
    return;
    Ti.API.info(limit);
    var rows = limit || rowLimit;
    var time = new Date().getTime();
    //Ti.API.info(data);
    //
    //table.startLayout();
    table.hide();
    
    for (var i = table.children.length - 1; i >= 0; i--) {
        table.remove(table.children[i]);
    }
    //table.setData([]);
    var list = [];
    for (var i = 0; i < rows && i < data.length; i++) {
        var station = data[i];
        if (!station)
            continue;

        var row = rowCache[station.id];
        if (row) {
            row.children[0].text = station.distance.toFixed(1) + ' км';
            list.push(row);
            continue;
        }
        row = createRow(station, table.vr);
        //rowCache[station.id] = row;
        list.push(row);
        table.add(row);
        row.addEventListener("click", callback);
    }
    //table.setData(list);
    table.show();
    //table.finishLayout();
    //container.add(table);
    Ti.API.info('BUILD LIST IN ' + (new Date().getTime() - time) + "ms");
}

function ListWindow(options) {
    var AIndicator = require('/ui/common/AIWindow');
    var mapview, regionsWindow;

    var mode = "list";
    var filtered = false;

    //create component instance
    var self = Ti.UI.createWindow({
        backgroundImage : "/images/list_bg.png"
    });
    var header = new UI.WindowHeader({
        has_back : 1,
        title : L('azs'),
        list_map : true
    });
    self.add(header);
    self.clickBack = function() {
        if (mode == "list" && !filtered) {
            Ti.App.fireEvent("closeListAZSWindow");
        } else if (mode == "list" && filtered) {
            invokeList(1);
            self.closeFilter();
            filtered = false;
        } else if (mode == "map") {
            invokeList(1);
        } else if (mode == "regions") {
            invokeList(1);
        } else if (mode == "areas") {
            invokeRegions();
        }

    };

    header.addEventListener("back", self.clickBack);
    self.addEventListener("backButtonClicked", self.clickBack);

    header.addEventListener('changeMode', function(e) {
        Ti.API.info('CHANGE MODE 1111' + e.index);
        if (e.index == 1) {
            invokeMap(e);
            mode = "map";
        } else {
            invokeList(false);
            mode = "list";
        }
    });

    var holder = Ti.UI.createView({
        top : UI.size.header
    });
    self.add(holder);

    var container = Ti.UI.createView({
    });
    holder.add(container);

    var section = Ti.UI.createListSection();
    var table = Ti.UI.createListView({
        sections: [section],
        templates: { 'template': rowTemplate },
        defaultItemTemplate: 'template',
        backgroundColor: 'transparent',
        rowHeight: rowHeight,
        top : 0,
        bottom : UI.size.footer,        
    });
    container.table = table;
    container.add(table);

    self.addEventListener('reload', function(e) {
        self.makeDataList();
    });
    var filter = new UI.FilterSection();
    self.closeFilter = function() {
        if (options && options.fuels) {
            delete options.fuels;
        }
        if (options && options.areaId) {
            delete options.areaId;
        }
        self.remove(filter);
        filtered = false;
        self.makeDataList();
    }
    filter.addEventListener("closeFilter", self.closeFilter);

    //BUTTON BARS

    var bottomBar = new UI.WindowFooter({
        button_bar : [L('list_dist'), L('list_regions')],
        right_button: true,
    });
    bottomBar.addEventListener('rightBtnTap', function(e) {
        if (!Ti.Geolocation.locationServicesEnabled) {
            UI.AlertDialog(L('error_disable_geo'));
            return;
        }

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
            Ti.App.Properties.setString('currPosition', JSON.stringify(currPos));
            Ti.App.currPosition = currPos;
            
            self.makeDataList(filtered ? filterData : {});
        });
        
    });

    container.bottomBar = bottomBar;
    var bbIndex = 0;
    bottomBar.addEventListener('changeMode', function(e) {
        Ti.API.info('MODE CHANGED BOTTOM: ' + e.index);

        if (bbIndex == e.index)
            return;
        bbIndex = e.index;
        if (e.index == 1) {
            invokeRegions();
        } else {
            invokeList();
        }
    });

    container.add(table);

    container.add(bottomBar);

    //EVENTS
    if (options.fuels) {
        filter.addText('Газ');
        self.add(filter);
        filtered = true;
    }
    var filterData = {};
    self.filterList = function(data) {

        bottomBar.buttonBarIndex(0);
        bbIndex = 0;
        self.makeDataList({
            areaId : data.filteringAreaId,
            fuels : options.fuels
        });
        filterData = {
            areaId : data.filteringAreaId,
            fuels : options.fuels
        }; 
        filtered = true;

    };
    Ti.App.addEventListener('filterList', self.filterList);

    self.filterStringShow = function(e) {
        if (!options.fuels) {
            filter.addText(e.filterString);
        } else {
            filter.addText('Газ : ' + e.filterString);
        }
        self.add(filter);
        filter.show();
        mode = "list";
    }

    Ti.App.addEventListener('filterStringShow', self.filterStringShow);

    self.refreshListWindow = function(options) {
        if (options.map && options.station) {
            invokeMap({
                index : 1,
                station : options.station,
                disableAnim : true,
                destination : options.destination
            });
            //header.listMapIndex(1);
        } else {
            if (!options.station)
                return;

            //Ti.API.info('FIRE NO MAP CLOSE')
            invokeMap({
                index : 1,
                station : options.station,
                disableAnim : true,
                noMapClose : true
            });
        }
    }

    Ti.App.addEventListener('returnListWindow', self.refreshListWindow);

    //click map from Nearest

    self.addEventListener('close', function(e) {
        Ti.API.info('close ListWindow');
        Ti.App.removeEventListener('filterList', self.filterList);
        Ti.App.removeEventListener('filterStringShow', self.filterStringShow);
        Ti.App.removeEventListener('returnListWindow', self.refreshListWindow);
        //Ti.Geolocation.removeEventListener('location', locationEvent);
    })

    //FOR BUTTONS BOTTOM BAR
    var invokeDistance, invokeRegions, invokeList, addMap;

    invokeMap = function(e) {
        mode = "map";
        filter.hide();
        if (!mapview) {
            mapview = new MapView({
                mode : "station"
            });
        }

        if (e && e.destination) {
            mapview.drawRoute(e.destination);
        }
        UI.replaceView(container, mapview, e.disableAnim);
        header.listMapIndex(1);
        if (e.station) {
            mapview.activeAnnotation(e.station, e.destination ? 1 : 0);
        } else {
            mapview.activeAnnotation(null);
        }
    };

    invokeList = function(back) {
        mode = "list";
        if (!loaded) {
            self.makeDataList({
                fuels : options.fuels
            });
            loaded = true;
        }

        filter.show();
        UI.replaceView(container, table, false, bottomBar, back);

        container.add(bottomBar);
        header.listMapIndex(0);
        bottomBar.buttonBarIndex(0);
        bbIndex = 0;
    }
    invokeRegions = function(back) {
        filter.hide();
        mode = "regions";
        if (!regionsWindow) {
            var RegionsWindow = require('/ui/common/AZS/RegionsWindow');
            regionsWindow = new RegionsWindow(container, "filterList", "filterStringShow");
        }

        UI.replaceView(container, regionsWindow, false, bottomBar, back);
        header.listMapIndex(0);
        bottomBar.buttonBarIndex(1);
        bbIndex = 1;

    }
    var loaded = false;
    self.addEventListener('open', function(e) {
        sFuels = models.fuel.getList();
        if (options.refresh) {
            invokeMap({
                station : options.station,
                disableAnim : true,
            });
            return;
        }
        if (mode != "list")
            return;
        Ti.API.info('open ListWindow')
        setTimeout(function() {
            self.makeDataList({
                fuels : options.fuels
            });
            loaded = true;
        }, 100);
    });



    self.clickRow = function(e) {
        if (e.source && e.source.stationData) {
            var data = e.source.stationData;
            var over = Ti.UI.createView({
                opacity : 0.2,
                backgroundColor : "blue"
            });
            e.source.add(over);
            setTimeout(function() {
                e.source.remove(over);
                over = null
            }, 300);
            Ti.App.fireEvent('openSingleAZSWindow', {
                data : JSON.parse(JSON.stringify(data))
            });
        }
    }; 

    self.makeDataList = function(params) {
        AIndicator.show({
            title : L('loading')
        });
        var data = models.station.getList(params);
        if (!params) {
            params = {};
        }
        if (data) {
            
            Ti.API.info(data);
            var items = []; var limit = params.areaId  ? 99999999 : 20;
            section.setItems([]);
            for (var i = 0; i < data.length && i < limit; ++i) {
                var station = data[i];
                items.push({ addr: { text: station.addr }, brand: { text: station.brand }, distance:{text: station.distance.toFixed(1) + ' км',} });
                if (items.length == 10) {
                    section.appendItems(items);
                    items = [];
                }
            }

            
            //makeTableData(data, table, container, params.areaId ? 999999 : 0, self.clickRow);
        }

        AIndicator.hide();

    };


    return self;
}

module.exports = ListWindow;
