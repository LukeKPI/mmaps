// This is a single context application with mutliple windows in a stack
(function() {
    Ti.App.GoogleMapsApiV2 = true;
    var Data = require('/models/Data');
    Data.readData();
    //determine platform and form factor and render approproate components
    var osname = Ti.Platform.osname, version = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth;

    //considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
    //yourself what you consider a tablet form factor for android
    var android = (osname === 'android') ? 1 : 0;
    function px2dip(ThePixels) {
        return android ? (ThePixels / (Titanium.Platform.displayCaps.dpi / 160)) : ThePixels;
    };
    var isTablet = osname === 'ipad' || (osname === 'android' && (px2dip(width) >= 600 && px2dip(height) >= 600));
    var openWindow;
    var Window;
    var cPos = Ti.App.Properties.getString('currPosition', JSON.stringify({
        lat : 50.464833,
        lon : 30.373662
    }));
    Ti.App.currPosition = JSON.parse(cPos);
    //Ti.App.Properties.setString('currPosition', JSON.stringify(cPos));


    if (android) {
        var ApplicationTabGroup = require('/ui/common/AndroidTabGroup');
        var TabGroup = ApplicationTabGroup.TabGroup;
        var Tab = ApplicationTabGroup.Tab;
        Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
        // demonstrates manual mode:
        var provider;
        try {
             provider = Ti.Geolocation.Android.createLocationProvider({
                name: Ti.Geolocation.PROVIDER_GPS,
                minUpdateDistance: 50.0,
                minUpdateTime: 60
            });
            Ti.Geolocation.Android.addLocationProvider(provider);
            Ti.Geolocation.Android.manualMode = true;
        } catch(ex) {
        }
        var locationAdded = false;
        var handleLocation = function(geo) {
            if (geo.success) {
                var data = {
                    lat : 
                    geo.coords.latitude,
                    lon : 
                    geo.coords.longitude
                }
                Ti.API.info('GEO Latitude = ' + data.lat + '/' + geo.coords.latitude);
                Ti.API.info('GEO Longitude = ' + data.lon);
                Ti.App.Properties.setString('currPosition', JSON.stringify(data));
                Ti.App.currPosition = data;
            }
        };
        var addHandler = function() {
            if (!locationAdded) {
                Ti.Geolocation.addEventListener('location', handleLocation);
                locationAdded = true;
            }
        };
        var removeHandler = function() {
            if (locationAdded) {
                Ti.Geolocation.removeEventListener('location', handleLocation);
                locationAdded = false;
            }
        };
        
        Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
        Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
        if (Ti.Geolocation.locationServicesEnabled) {
            addHandler();
            var activity = Ti.Android.currentActivity;
            activity.addEventListener('destroy', removeHandler);
            activity.addEventListener('pause', removeHandler);
            activity.addEventListener('resume', addHandler);
        } else {
            Ti.UI.createAlertDialog({
                message: L('error_disable_geo'),
                ok: 'OK',
                title: 'Geolocation'
            }).show()
        }        
        
    } else {
        var TabGroup = function(d) {
            return Ti.UI.createTabGroup(d);
        };
        var Tab = function(d) {
            d.window = new d.windowClass();
            d.window.navBarHidden = true;
            d.windowsClass = null;
            var tab = Ti.UI.createTab(d); 
            tab.window.navGroup = tab;
            return tab;
        }
    }

    var MainWindow = isTablet ? require('/ui/tablet/MainMenu') : require('/ui/common/MainMenu');
    Ti.UI.setBackgroundImage('/images/list_bg.png');
    var root = TabGroup({
        navBarHidden : true,
    });
    var hTab = Tab({
        title : "Главная",
        icon: "/images/tabs/home.png",
        windowClass : MainWindow
    });
    if(!android) {
        hTab.window.tabBarHidden = true;
    }

    var NearestWindow = require('/ui/common/AZS/NearestWindow');
    var azsTab = new Tab({
        title : L("azs"),
        icon: "/images/tabs/azs.png",
        windowClass : NearestWindow
    });
    if (!android) azsTab.window.navBarHidden = true;

    var KartListWindow = require('/ui/common/Kart/KartListWindow');
    var kartTab = new Tab({
        title : L("mi_kart_tab"),
        icon: "/images/tabs/seller.png",
        windowClass : KartListWindow
    });

    var OptListWindow = require('/ui/common/Opt/OptListWindow');
    var optTab = new Tab({
        title : L("mi_opt_tab"),
        icon: "/images/tabs/opt.png",
        windowClass : OptListWindow
    });

    var StatisticWindow = require('/ui/common/Rozrah/StatisticWindow')
    var statTab = new Tab({
        title : L("rozrah_menu_title"),
        icon: "/images/tabs/ras.png",
        windowClass : StatisticWindow
    });

    root.addTab(hTab);
    root.addTab(azsTab);
    root.addTab(kartTab);
    root.addTab(optTab);
    root.addTab(statTab);
    root.addEventListener("open", function() {
        root.setActiveTab(0);
    });
    
    root.open();
    openWindow = function(win) {
        if (android) {
            root.activeTab.open(win);
        } else {
            root.activeTab.open(win, {
                animated : true
            });
        }
    };
    function closeWindow(win) {
        if (android) {
            if (win) win.close();
            win = null;
        } else {
            root.activeTab.close(win, {animated: true});
        }
    }

    var nav = root.activeTab;
    Ti.App.addEventListener('showFirstTab', function(e) {
           root.setActiveTab(0);
    });

    //events to open windows
    Ti.App.addEventListener('openNearestWindow', function(e) {
        root.setActiveTab(1);
    });
    var listAZSWIndow = null;
    Ti.App.addEventListener('openListWindow', function(e) {
        if (listAZSWIndow != null) {
            //openWindow(listAZSWIndow);
            listAZSWIndow.close();
            listAZSWIndow = null;
            //return;
        }
        if (singleAZSWindow != null) {
            singleAZSWindow.close();
            singleAZSWindow = null;
            //openWindow(singleAZSWindow);
            //return;
        }
        
        var ListWindow = require('/ui/common/AZS/ListWindow');

        listAZSWIndow = new ListWindow({
            fuels : e.fuels,
            refresh : e.refresh,
            station : e.station
        });
        listAZSWIndow.navGroup = azsTab;
        openWindow(listAZSWIndow);
    });

    Ti.App.addEventListener('closeListAZSWindow', function(e) {
        listAZSWIndow.close({
            animated : true
        });
        listAZSWIndow = null;
        if (singleAZSWindow != null) {
            singleAZSWindow.close();
            singleAZSWindow = null;
            //openWindow(singleAZSWindow);
            //return;
        }
        
    });

    var singleAZSWindow = null;
    var SingleAZSWindow = require('/ui/common/AZS/SingleAZSWindow');
    Ti.App.addEventListener('openSingleAZSWindow', function(e) {
        Ti.API.info('OPENNNNNNN')
        if (singleAZSWindow != null) {
            singleAZSWindow.close();
            singleAZSWindow = null;
            //openWindow(singleAZSWindow);
            //return;
        }
        singleAZSWindow = new SingleAZSWindow(e);
        openWindow(singleAZSWindow);
    });

    Ti.App.addEventListener('closeSingleAZSWindow', function(e) {
        if (singleAZSWindow == null) return;
        if (!android) {
            singleAZSWindow.close({
                animated : true
            });
            singleAZSWindow = null;
            return;
            azsTab.close(singleAZSWindow);
            singleAZSWindow = null;
        } else {
            closeWindow(singleAZSWindow);
            singleAZSWindow = null;
        }
    });

    //2ND MENU EVENTS

    Ti.App.addEventListener('openKartListWindow', function(e) {
        root.setActiveTab(2);
    });

    var singleKartWindow = null;
    var SingleKartWindow = require('/ui/common/Kart/SingleKartWindow');
    function openSingleKart(e) {
        if (singleKartWindow != null) {
            singleKartWindow.close();
            singleKartWindow = null;
        }
        singleKartWindow = new SingleKartWindow(e);
        openWindow(singleKartWindow);
    }    
    Ti.App.addEventListener('openSingleKartWindow', openSingleKart);

    function closeSingleCart(e) {
        closeWindow(singleKartWindow);
        singleKartWindow = null;
    }
    Ti.App.addEventListener('closeSingleKartWindow', closeSingleCart);
    //3RD MENU EVENTS
    Ti.App.addEventListener('openOptListWindow', function(e) {
        root.setActiveTab(3);
    });

    var singleOptWindow;
    Ti.App.addEventListener('openSingleOptWindow', function(e) {
        if (singleOptWindow != null) {
            //openWindow(singleOptWindow);
            singleOptWindow.close();
            singleOptWindow = null;
            //return;
        }

        var SingleOptWindow = require('/ui/common/Opt/SingleOptWindow');

        singleOptWindow = new SingleOptWindow(e);
        openWindow(singleOptWindow);
    });

    Ti.App.addEventListener('closeSingleOptWindow', function(e) {
        closeWindow(singleOptWindow);
        singleOptWindow = null;
    });

    var statisticWindow;
    Ti.App.addEventListener('openRozrahWindow', function(e) {
        root.setActiveTab(4);
    });

    var selectWindow;
    Ti.App.addEventListener('openSelectWindow', function(e) {
        if (selectWindow != null)
            return;

        var SelectWindow = require('/ui/common/Rozrah/SelectWindow');

        selectWindow = new SelectWindow();
        if (e.record) {
            selectWindow.editRecord(e.record);
        } else {
            selectWindow.createNewRecord();
        }

        selectWindow.addEventListener('edited', function(e) {
            var list;
            if (e.record.id) {
                list = Data.updateRashodRecord(e.record); 
            } else {
                list = Data.addRashodRecord(e.record);
            }
            Ti.API.info(JSON.stringify(e.record));
            root.activeTab.window.fireEvent('refresh', {
                showRefuelList : true,
                data: list
            });
        });
        selectWindow.addEventListener('removed', function(e) {
            var list = Data.deleteRashodRecord(e.record.id); 
            root.activeTab.window.fireEvent('refresh', {
                showRefuelList : true,
                data: list
            });
        });

        if (isTablet && !android) {
            selectWindow.open({
                modal : true,
                modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
                modalStyle : Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
            });
        } else {
            openWindow(selectWindow);
        }
    });

    Ti.App.addEventListener('closeSelectWindow', function(e) {
        if (!android) {
            if (isTablet) {
                selectWindow.close();
                selectWindow = null;
                return;
            }
        }
        closeWindow(selectWindow);
        selectWindow = null;
    });

    var infoWindow;
    Ti.App.addEventListener('openInfoWindow', function(e) {
        if (infoWindow != null) {
            openWindow(infoWindow);
            return;
        }

        var InfoWindow = require('/ui/common/Rozrah/InfoWindow')
        infoWindow = new InfoWindow();
        openWindow(infoWindow);
    });

    Ti.App.addEventListener('closeInfoWindow', function(e) {
        closeWindow(infoWindow);
        infoWindow = null;
    });

    Ti.Geolocation.purpose = 'Для расчета расстояний до ближайшей станции';
    Ti.App.addEventListener("calculateCurrentPosition", function(e) {
        Ti.Geolocation.getCurrentPosition(function(geo) {
            //Ti.API.info(geo)
            Ti.API.info('GEOLOCATION START APP.js')
            if (geo.success) {
                Ti.API.info('GEO success');
                var data = {
                    lat : /*50.464833,*/
                    geo.coords.latitude,
                    lon : /*30.373662*/
                    geo.coords.longitude
                }

                Ti.API.info('GEO Latitude = ' + data.lat + '/' + geo.coords.latitude);
                Ti.API.info('GEO Longitude = ' + data.lon);
            } else {
                Ti.API.info('GEO failure');
                var currPos = Ti.App.Properties.getString('currPosition', JSON.stringify({
                    lat : 50.464833,
                    lon : 30.373662
                })); 
                currPos = JSON.parse(currPos);
                var data = {
                    lat : currPos.lat,
                    lon : currPos.lon
                };
                Ti.App.Properties.setBool('geofailure', true);
            }
            Ti.App.Properties.setString('currPosition', JSON.stringify(data));
            Ti.App.currPosition = data;
        });
    });
    
    setTimeout(function(){
       Data.checkUpdates(function(success, error) {
           if (success) {
               Ti.App.Properties.setString('lastUpdate', String.formatDate(new Date()));
           }
       });
    }, 18000);

})();
