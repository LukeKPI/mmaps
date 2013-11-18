//FirstView Component Constructor
var android = Ti.Platform.osname == 'android';
var UI = require('/ui/common/UI');
var Data = require('/models/Data');

//var RunningLine = require('/ui/common/RString');
    function px2dip(ThePixels)
    {
      return !android ? ThePixels : (ThePixels / (Titanium.Platform.displayCaps.dpi / 160));
    };
 
 
    function dip2px(TheDPUnits)
    {
      return !android ? ThePixels : (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160));
    };

function MainMenu() {
    var osname = Ti.Platform.osname;
    var osname = Ti.Platform.osname, version = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth;
    var isAndroid = (osname === 'android') ? true : false, configView;
    var isTablet = osname === 'ipad' || (osname === 'android' && (px2dip(width) >= 600 && px2dip(height) >= 600));
    //create object instance, a parasitic subclass of Observable
    var self = Ti.UI.createWindow({
    });

    var delta = px2dip(Ti.Platform.displayCaps.platformWidth / 320);

    var ph = px2dip(Ti.Platform.displayCaps.getPlatformHeight()) - 20 * delta;
    
    var headerHeight = 108 * delta;
    
    Ti.API.info("HH: " + headerHeight);
    var runningStringHeight = 66;

    var headerView = Ti.UI.createView({
        backgroundImage : '/images/i1_0/logo_tablet'+(Ti.Platform.locale == 'uk' ? '_uk':'')+'.png',
        height : headerHeight,
        top : 0
    });

    var table = Ti.UI.createView({
        top : headerHeight,
        backgroundColor : 'silver',
        bottom : runningStringHeight,
        layout : "vertical",
    });


    var footerView = Ti.UI.createView({
        backgroundImage : '/images/i1_0/footer.png',
        height : runningStringHeight,
        bottom : 0
    });

    var btnConfig = Ti.UI.createView({
        width : runningStringHeight-6,
        height : runningStringHeight-6,
        right : 6,
        backgroundImage : '/images/i1_0/cogwheel.png'
    });

    btnConfig.addEventListener('click', function(e) {
        var ConfigWindow = require('/ui/common/Config');
        configWindow = new ConfigWindow(self);
        
        configWindow.open({
            modal : !isAndroid,
            modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_PARTIAL_CURL
        });
    });

    footerView.add(btnConfig);

    var btnCounter = 0;

    var MenuItem = function(textId, text2Id, openWin, test_id, map) {
        //var rowHeight = Math.floor((ph - headerHeight - runningStringHeight) / 4);
        //var top = (rowHeight - 30) / 2;

        var menuItem = Ti.UI.createView({
            height : "25%",
            backgroundImage : '/images/i1_0/menu_row.png',
            
            //top : btnCounter * rowHeight
        })

        menuItem.add(Ti.UI.createView({
            backgroundImage : '/images/i1_0/arrow.png',
            width : 11,
            height : 16,
            right : 22
        }));

        var icoNum = btnCounter + 1;
        var icoPath = '/images/ico' + icoNum + '_tablet.png';

        menuItem.add(Ti.UI.createImageView({
            left : 0,
            top:0,
            bottom:0,
            image : icoPath
        }));
        
        var holder = Ti.UI.createView({
            left : 156+22,
            right: 50,
            layout : 'vertical',
            height : Ti.UI.SIZE,
        });

        var lbl = Ti.UI.createLabel({
            left : 0,
            text : textId,
            font : {
                fontWeight : 'bold',
                fontSize: "26dip"
            },
            color : '#ffffff',
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
        });
        holder.add(lbl);

        holder.add(Ti.UI.createLabel({
            left : 0,
            text : text2Id,
            font : {
                fontSize: "22dip"
            },
            color : '#ffffff',
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
        }));
        menuItem.add(holder);

        btnCounter++;
        menuItem.addEventListener('singletap', function(e) {
            menuItem.backgroundImage = '/images/i1_0/menu_row_hover.png';
            menuItem.children[2].children[0].color = '#ecf1b4';
            menuItem.children[2].children[1].color = '#ecf1b4';
            Ti.App.fireEvent(openWin, {test_id:test_id, refresh : map});

            setTimeout(function() {
                menuItem.backgroundImage = '/images/i1_0/menu_row.png';
                menuItem.children[2].children[0].color = '#fff';
                menuItem.children[2].children[1].color = '#fff';
            }, 200);
        });
        
        var nearest = Ti.UI.createLabel({
            right : 6,
            bottom : isAndroid? 11 : 6,
            text : "",
            height : "18dp",
            wordWrap : false, 
            font : {
                fontSize: "15dip"
            },
            color : '#dddddd',
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            width: "70%",
        });
        menuItem.add(nearest);
        
        menuItem.addNearestText = function( text ) {
            nearest.text = text;
        };


        return menuItem;
    };

    self.add(headerView);
    self.add(footerView);

    var miAZS = new MenuItem(L('mi_azs'), L('mi_azs_hint'), 'openListWindow', 2, true);
    var miKart = new MenuItem(L('mi_kart'), L('mi_kart_hint'), 'openListWindow', 3, true);
    var miOpt = new MenuItem(L('mi_opt'), L('mi_opt_hint'), 'openListWindow', 1);
    var miRash = new MenuItem(L('mi_rashod'), L('mi_rashod_hint'), 'openListWindow', 4);
    table.add(miAZS);
    table.add(miKart);
    table.add(miOpt);
    table.add(miRash);

    self.add(table);
    
    /*var runningLine =  new RunningLine(runningStringHeight);
    runningLine.bottom = 0;
    runningLine.right = runningStringHeight;
    runningLine.left = 0;
    footerView.add(runningLine);
    
    self.addEventListener("focus", function(e) {
        runningLine.stop();
        runningLine.start();
    });
    
    Ti.App.addEventListener("resumed", function(e) {
        runningLine.stop();
        runningLine.start();
    }); 
    */
    var siteLabel = Ti.UI.createLabel({
       text: "www.avias.com.ua",
       color: "navy",
       font: {
           fontSize: "22dp",
       }, 
       width: "auto",
       height: 44,
       textAlign: "center",
    });
    footerView.add(siteLabel);
    siteLabel.addEventListener("singletap", function(){
        Ti.Platform.openURL("http://www.avias.com.ua");
    });
    function updateNearest() {
        miAZS.addNearestText(Ti.App.nearestStation.addr + " (" + Ti.App.nearestStation.distance.toFixed(1) + "км)");
        miKart.addNearestText(Ti.App.nearestCardSeller.addr +  " (" + Ti.App.nearestCardSeller.distance.toFixed(1) + "км)");
        miOpt.addNearestText(Ti.App.nearestOpt.addr + " (" + Ti.App.nearestOpt.distance.toFixed(1) + "км)");
    }


    var updateTimer = 0;
    function updateGeoPosition() {
        clearTimeout(updateTimer);
        Ti.Geolocation.getCurrentPosition(function(geo) {
            Ti.API.info('GEOLOCATION START APP.js')
            if (geo.success) {
                Ti.API.info('GEO success');
                var data = {
                    lat : geo.coords.latitude,
                    lon : geo.coords.longitude
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
            //get nearest AZS
            if (!Ti.App.nearestStation) {
                var stations = Data.models.station.getList();
                Ti.App.nearestStation = stations[0];
            }

            //get nearest Card
            if (!Ti.App.nearestCardSeller) {
                var list = Data.models.card_seller.getList();
                Ti.App.nearestCardSeller = list[0];
            }
            //get nearest Opt
            if (!Ti.App.nearestOpt) {
                var list = Data.models.wholesaler.getList();
                Ti.App.nearestOpt = list[0];
            }

            updateNearest();

        });
        setTimeout(updateGeoPosition, 1000*60*5);
    }        

    self.addEventListener("open", updateGeoPosition);
    
    
    Ti.App.addEventListener("pause", function(){
        Ti.API.info('CLEAR UPDATE TIMER');
        clearTimeout(updateTimer);
    });

    Ti.App.addEventListener("resume", function(){
        Ti.API.info('UPDATE GEO POSITION');
        updateGeoPosition();
    });
          
    return self;
}

module.exports = MainMenu;
