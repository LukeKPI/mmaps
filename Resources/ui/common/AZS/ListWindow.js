var Data = require('/models/Data');
var models = Data.models;
var MapView = require('/ui/common/MapView').MapView;
var UI = require('/ui/common/UI');
var _ = require('libs/underscore-min');

var android = (Ti.Platform.osname == 'android') ? 1 : 0, mapGeneralRegion;
//oneGeoEventAdd - for one time adding
var rowHeight = UI.isTablet ? 99 : 66, rowLimit = android ? 20 : 20;
var rowCache = {};
var loadingTemplate = {
    properties : {
        height : rowHeight,
        
        allowsSelection: false,
    },
    childTemplates : [
        {
            type : "Ti.UI.Label",
            bindId : 'label',
            properties : {
                backgroundImage : '/images/list_item_bg.png',
                left:0, right:0,
                top:0, bottom:0,
                textAlign:"center",
                text: L("loading")+"...",
                color : '#666666',
                font : {
                    fontSize : UI.isTablet ? "15dp" : "11dip",
                    fontWeight : 'bold',
                },
                touchEnabled : false
            }
    }]
};
    
var rowTemplate = {
    properties : {
        height : rowHeight,
        allowsSelection: false,
    },
    childTemplates : [{
        type : "Ti.UI.View",
        bindId : 'bg',
        properties: {
            backgroundImage : '/images/list_item_bg.png',
        },
        childTemplates : [
        {
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
                shadowColor : "#e8e8e9",
                shadowOffset : {
                    x : 0,
                    y : 1
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
    }]
};


function ListWindow(options) {
    var AIndicator = require('/ui/common/AIWindow');
    var mapview, regionsWindow, areasWindow;

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
        if (mode == "list" && selectedArea) {
            invokeAreas(1);
        } else if (mode == "list" ) {
            Ti.App.fireEvent("closeListAZSWindow");
        } else if (mode == "map") {
            invokeList(1);
        } else if (mode == "regions") {
            selectedRegion = null;
            selectedArea = null;
            hideFilter();
            self.remove(filter);
            filtered = false;
            self.makeDataList();
            invokeList(1);
        } else if (mode == "areas") {
            invokeRegions(1);
        }

    };

    header.addEventListener("back", self.clickBack);
    self.addEventListener("backButtonClicked", self.clickBack);

    header.addEventListener('changeMode', function(e) {
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
        templates: { 'template': rowTemplate, 'loading': loadingTemplate },
        defaultItemTemplate: 'template',
        backgroundColor: 'transparent',
        rowHeight: rowHeight,
        top : 0,
        bottom : UI.size.footer,
        showVerticalScrollIndicator: true,        
    });
    container.table = table;
    container.add(table);


    self.addEventListener('reload', function(e) {
        self.makeDataList();
    });
    var filter = new UI.FilterSection();
    self.closeFilter = function() {
        selectedFuel = null;
        selectedArea = null;
        selectedRegion = null;
        hideFilter();
        self.remove(filter);
        filtered = false;
        self.makeDataList();
    }
    filter.addEventListener("closeFilter", self.closeFilter);

    //BUTTON BARS

    var bottomBar = new UI.WindowFooter({
        button_bar : (options.test_id != 1) ?[L('list_dist'), L('list_regions')] :null,
        right_button: (options.test_id != 1) ?true : false,
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
            
            self.makeDataList();
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
        Ti.App.removeEventListener('returnListWindow', self.refreshListWindow);
        //Ti.Geolocation.removeEventListener('location', locationEvent);
    })

    
    var invokeDistance, invokeRegions, invokeList, addMap, invokeAreas, selectedFuel, selectedArea, selectedRegion;
    selectedFuel = options.fuels;
    function hideFilter(){
        filter.hide();
        table.bottom = UI.size.footer;
    }
    invokeMap = function(e) {
        mode = "map";
        hideFilter();
        if (!mapview) {
            mapview = new MapView({
                mode : "station"
            });
        }

        if (e && e.destination) {
            mapview.drawRoute(e.destination);
        }
        UI.replaceView(container, mapview.getView(), e.disableAnim);
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
            self.makeDataList();
            loaded = true;
        }

        filter.show();
        UI.replaceView(container, table, false, bottomBar, back);

        container.add(bottomBar);
        header.listMapIndex(0);
        (options.test_id != 1) ?bottomBar.buttonBarIndex(0) :null;
        bbIndex = 0;
        
    }
    invokeRegions = function(back) {
        hideFilter();
        mode = "regions";
        if (!regionsWindow) {
            var RegionsWindow = require('/ui/common/AZS/RegionsWindow');
            regionsWindow = new RegionsWindow(function(regionRec){
                Ti.API.info(regionRec);
                selectedRegion = regionRec;
                invokeAreas();
            });
        }

        UI.replaceView(container, regionsWindow, false, bottomBar, back);
        header.listMapIndex(0);
        (options.test_id != 1) ?bottomBar.buttonBarIndex(1) :null;
        bbIndex = 1;

    }
/*        var fs = (UI.isUk) ?selectedRegion.name_ua :selectedRegion.name ;
        if (!selectedRegion.name.match(/Крым/)) {
            fs += ' обл.';
        }*/
    invokeAreas = function(back) {
        hideFilter();
        mode = "areas";
        if (!areasWindow) {
            var AreasWindow = require('/ui/common/AZS/AreasWindow');
            areasWindow = new AreasWindow( function(areaRec) {
               Ti.API.info(areaRec);
               selectedArea = areaRec;
               filterList(); 
            });
        }
        areasWindow.addData(selectedRegion);
        UI.replaceView(container, areasWindow, false, bottomBar, back);
        header.listMapIndex(0);
        (options.test_id != 1) ?bottomBar.buttonBarIndex(1):null;
        bbIndex = 1;
    }
    
    var filterList = function(back) {
        loaded = false;
        invokeList(back);
    }
    function showFilter() {
        var fs = "", fuelsHash = models.fuel.getHash(), selectedFuel = options.fuels;
        
        _.each(selectedFuel, function(fuelCode) {
             var fuelData = _.find(fuelsHash, function(fuel) {
                return fuel.code == fuelCode;
            });
            if (!fuelData) {
                return;
            }
            fs += fuelData.name + ', ';
        });
        fs = fs.substring(0, fs.length - 2);
        
        if (selectedRegion) {
            var reg = (UI.isUk) ?selectedRegion.name_ua :selectedRegion.name ;
            if (!selectedRegion.name.match(/Крым/)) {
                reg += ' обл. ';
            }
            if (fs) fs += ", ";
            fs += reg;
        }
        if (selectedArea && !selectedArea.all) {
            var area = (UI.isUk) ?selectedArea.name_ua :selectedArea.name ;
            if (selectedArea.name.match(/ий$/)) {
                area += ' р-н.';
            }
            if (fs) fs += " ";
            fs += area;
        }
        
        if (!fs) {
            return;
        }
        
        filter.addText(fs);
        self.add(filter);
        filter.show();
        table.bottom = UI.size.filter + UI.size.footer;
    }
    
    
    var loaded = false;
    self.addEventListener('open', function(e) {
        selectedFuel = options.fuels;
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
        self.makeDataList();
    });



    self.clickRow = function(e) {
        Ti.API.info(e);
        var item = e.section.getItemAt(e.itemIndex);
        Ti.API.info(item);
        if (item.stationData) {
            var data = item.stationData;
            var item = _.extend(item, {bg: {backgroundImage: "/images/list_item_bg_tap.png"}});
            e.section.updateItemAt(e.itemIndex,item);
            setTimeout(function() {
                e.section.updateItemAt(e.itemIndex, _.extend(item, {bg: {backgroundImage: "/images/list_item_bg.png"}}));
            }, 500);
            Ti.App.fireEvent('openSingleAZSWindow', {
                data : JSON.parse(JSON.stringify(data))
            });
        }
    }; 
    table.addEventListener("itemclick", self.clickRow);
    self.makeDataList = function() {
        
        table.setSections([Ti.UI.createListSection({items:[{template: "loading"}]})]);
        
        var params = {};
        params.test_id = options.test_id
        if (selectedFuel) {
            params.fuels = selectedFuel;
        }
        if (selectedArea) {
            if (selectedArea.all) {
                params.regionId = selectedArea.region_id;
            } else {
                params.areaId = selectedArea.id;
            }
        }
        
        
        var data = models.station.getList(params);
        if (!params) {
            params = {};
        }
        if (data) {
            
            //Ti.API.info(data);
            var items = []; var limit = params.areaId  ? 99999999 : 300;
            var sections = [];
            //var first = 0;
            for (var i = 0; i < data.length && i < limit; ++i) {
                var station = data[i];
                items.push({ addr: { text: station.addr }, brand: { text: station.brand }, distance:{text: station.distance.toFixed(1) + ' км'}, stationData: _.clone(station) });
            }
            //new_section.setItems(items);
            var new_section = Ti.UI.createListSection({items:items});
            table.setSections([new_section]);
            section = null;
            section = new_section;
            //makeTableData(data, rowHolder, container, params.areaId || params.regionId ? 999999 : 0, self.clickRow);
        }
        if (selectedFuel || selectedArea) {
            showFilter();
        }
        //AIndicator.hide();

    };

    self.addEventListener("hideTab", function() {
        invokeList();
    });
    return self;
}

module.exports = ListWindow;
