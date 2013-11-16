var Data = require('/models/Data');
var models = Data.models;
var UI = require('/ui/common/UI');
var _ = require('libs/underscore-min');

var rowHeight = UI.isTablet ? 99 : 66, rowLimit = 50;

var android = (Ti.Platform.osname == 'android') ? 1 : 0, mapGeneralRegion;
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
        childTemplates : [{


                type: "Ti.UI.Label",
                bindId:"distance",
                properties: {
                    font : {
                        fontSize : UI.isTablet ? "14dp" : "10dip"
                    },
                    color : '#2a79be',
                    right : 24,
                    touchEnabled : false
                }
            },
            
            {
                type:"Ti.UI.ImageView", 
                properties: {
                    image : '/images/ra common/car.png',
                    width : 44,
                    height : 44,
                    left : 11,
                    touchEnabled : false
                }
            },{
                type: "Ti.UI.ImageView",
                properties: {
                    image : '/images/ra common/hasChild.png',
                    width : 10,
                    height : 20,
                    right : 6,
                    touchEnabled : false
                }
            },{
                type: "Ti.UI.Label",
                bindId:"brand",
                properties:{
                    font : {
                        fontSize : UI.isTablet ? "20dp" : "14dip",
                        fontWeight : 'bold'
                    },
                    shadowColor : "#e8e8e9",
                    shadowOffset : {
                        x : 0,
                        y : 1
                    },
                    height : UI.isTablet ? "24dp" : "16dip",
                    top : "20%",
                    wordWrap: false,
                    left : 66,
                    right : 66,
                    color : '#0a4882',
                    touchEnabled : false
                }
            },{
                type: "Ti.UI.Label",
                bindId:"addr",
                properties:{
                    wordWrap: false,
                    left : 66,
                    right : 66,
                    bottom : "17%",
                    color : '#4e4c4c',
                    height : UI.isTablet ? "18dp" : "14dip",
                    font : {
                        fontSize : UI.isTablet ? "14dp" : "11dip"
                    },
                    touchEnabled : false
                }
            }
        ]}
    ]
};

function OptListWindow(options) {
    
    var self = this;
    var AIndicator = require('/ui/common/AIWindow');
    var mapview, regionsWindow;
    var mode = "list";
    //create component instance
    var self = Ti.UI.createWindow({
        backgroundImage : "/images/list_bg.png",
    });

    var header = new UI.WindowHeader({
        has_back : 1,
        title : L('opt_list_title'),
        list_map : true
    });
    self.add(header);
    var filtered = false;
    self.clickBack = function() {
        Ti.API.info('FILTERED ' + filtered + " MODE " + mode);
        if (mode == "list" && !filtered) {
            Ti.App.fireEvent('showFirstTab');
        } else if (mode == "list" && filtered) {
            invokeRegions(1);
        } else if (mode == "map") {
            invokeList(1);
        } else if (mode == "regions") {
            Ti.API.info('CLOSE FILTER');
            self.closeFilter();
            invokeList(1);
            filtered = false;
        }

    };

    header.addEventListener("back", self.clickBack);
    self.addEventListener("backButtonClicked", self.clickBack);

    header.addEventListener('changeMode', function(e) {
        if (e.index == 1) {
            invokeMap(e);
        } else {
            invokeList();
        }
    });

    var container = Ti.UI.createView({
        top : UI.size.header
    });
    self.add(container);

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
    self.closeFilter = function(e) {
        self.remove(filter);
        self.makeDataList();
        filtered = false;
    };
    filter.addEventListener("closeFilter", self.closeFilter);

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

    bottomBar.addEventListener('changeMode', function(e) {
        if (e.index == 1) {
            invokeRegions();
        } else {
            invokeList();
        }
    });

    container.add(bottomBar);
    var filterData = {};
    self.filterList = function(data) {
        bottomBar.buttonBarIndex(0);
        self.makeDataList({
            regionId : data.filteringRegionId
        });
        filtered = true;
        filterData = {
            regionId : data.filteringRegionId
        };
        
    };
    Ti.App.addEventListener('filterOptList', self.filterList);

    self.filterStringShow = function(e) {
        filter.addText(e.filterString);
        self.add(filter);
        filter.show();
        Ti.API.info('FILTERED ' + filtered);
        filtered = true;
        mode = "list";
        table.bottom = UI.size.filter + UI.size.footer;

    }

    Ti.App.addEventListener('filterOptStringShow', self.filterStringShow);

    self.refreshListWindow = function(options) {
        if (options.map && options.wholesaler) {
            invokeMap({
                index : 1,
                wholesaler : options.wholesaler,
                disableAnim : true,
                destination : options.destination
            });
        } else {
            if (!options.wholesaler)
                return;

            invokeMap({
                index : 1,
                wholesaler : options.wholesaler,
                disableAnim : true,
                noMapClose : true
            });
        }
    }

    Ti.App.addEventListener('returnOptListWindow', self.refreshListWindow);

    self.addEventListener('open', function(e) {
        self.makeDataList();
    });

    function closeCleanup(){
        Ti.App.removeEventListener('filterOptList', self.filterList);
        Ti.App.removeEventListener('filterOptStringShow', self.filterStringShow);
        Ti.App.removeEventListener('returnOptListWindow', self.refreshListWindow);
        self.filterStringShow = null;
        self.filterList = null;
        self.refreshListWindow = null;
        if(android && mapview) {
            mapview.cleanup();
            container.remove(mapview.getView());
            mapview = null;
        }
    }
    //self.addEventListener('close', closeCleanup);
    
    self.clickRow = function(e) {
        Ti.API.info(e);
        var item = e.section.getItemAt(e.itemIndex);
        Ti.API.info(item);
        if (item.itemData) {
            var data = item.itemData;
            e.section.updateItemAt(e.itemIndex, _.extend(item, {bg: {backgroundImage: "/images/list_item_bg_tap.png"}}));
            setTimeout(function() {
                e.section.updateItemAt(e.itemIndex, _.extend(item, {bg: {backgroundImage: "/images/list_item_bg.png"}}));
            }, 500);
            Ti.App.fireEvent('openSingleOptWindow', {
                data : JSON.parse(JSON.stringify(data)),
            });
        }
    }; 
    table.addEventListener("itemclick", self.clickRow);
    

    self.makeDataList = function(params) {
        table.setSections([Ti.UI.createListSection({items:[{template: "loading"}]})]);
        var data = models.wholesaler.getList(params);
        if (data) {
            var items = []; var limit = 99999999999;
            var sections = [];
            //var first = 0;
            for (var i = 0; i < data.length && i < limit; ++i) {
                var item = data[i];
                items.push({ brand: { text: item.brand }, addr: { text: item.addr }, distance:{text: item.distance.toFixed(1) + ' км'}, itemData: _.clone(item) });
            }
            var new_section = Ti.UI.createListSection({items:items});
            table.setSections([new_section]);
            section = null;
            section = new_section;
        }
        if (params && params.regionId) {
            table.bottom = UI.size.filter + UI.size.footer;
        } else {
            table.bottom = UI.size.footer;
        }
        
    };
    var invokeDistance, invokeRegions, invokeMap, invokeList, addMap;
    function filterHide() {
        filter.hide();
        //table.bottom = UI.size.footer;
    }

    invokeMap = function(e) {
        mode = "map";
        filterHide();
        if (!mapview) {
            var MapView = require('/ui/common/MapView').MapView;
            mapview = new MapView({
                mode : "wholesaler",
                isStatic: false,
            });
            MapView = null;
        }
        if (e && e.destination) {
            mapview.drawRoute(e.destination);
        }
        UI.replaceView(container, mapview.getView(), e.disableAnim);
        header.listMapIndex(1);
        if (e.wholesaler) {
            mapview.activeAnnotation(e.wholesaler, e.destination ? 1 : 0);
        } else {
            mapview.activeAnnotation(null);
        }
    };

    invokeList = function(back) {
        UI.replaceView(container, table, false, bottomBar, back);
        filter.show();
        if (filtered) {
            table.bottom = UI.size.filter + UI.size.footer;
        } else {
            table.bottom = UI.size.footer;
        }
        header.listMapIndex(0);
        bottomBar.buttonBarIndex(0);
        mode = "list";
    }
    invokeRegions = function() {
        mode = "regions";
        if (!regionsWindow) {
            var RegionsWindow = require('/ui/common/Opt/OptRegionsWindow');
            regionsWindow = new RegionsWindow(container, "filterOptList", "filterOptStringShow");
        }
        UI.replaceView(container, regionsWindow, false, bottomBar);
        header.listMapIndex(0);
        bottomBar.buttonBarIndex(1);
    }
    self.addEventListener("hideTab", function() {
        invokeList();
    });
    
    return self;
}

module.exports = OptListWindow;
