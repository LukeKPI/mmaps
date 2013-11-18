//FirstView Component Constructor
var isAndroid = (Ti.Platform.osname === 'android') ? true : false;
//var RunningLine = require('/ui/common/RString');
var UI = require('/ui/common/UI');
var Data = require('/models/Data');


    function px2dip(ThePixels)
    {
      return isAndroid ? (ThePixels / (Titanium.Platform.displayCaps.dpi / 160)) : ThePixels;
    };
 
 
    function dip2px(TheDPUnits)
    {
      return isAndroid ? (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160)) : ThePixels;
    };

function MainMenu() {
    var isAndroid = (Ti.Platform.osname === 'android') ? true : false, configView;

    //create object instance, a parasitic subclass of Observable
    var self = Ti.UI.createWindow({
        //navBarHidden : true,
        //exitOnClose: true
    });
    var delta = px2dip(Ti.Platform.displayCaps.platformWidth / 320);

    var ph = px2dip(Ti.Platform.displayCaps.getPlatformHeight()) - 20 * delta;
    
    var headerHeight = 108 * delta;
    var runningStringHeight = 44;

    var headerView = Ti.UI.createView({
        backgroundImage : '/images/i1_0/logo'+(Ti.Platform.locale == 'uk' ? '_uk':'')+'.png',
        height : headerHeight,
        top : 0
    });

    var table = Ti.UI.createView({
        top : headerHeight,
        backgroundColor : 'silver',
        bottom : runningStringHeight,
        layout : "vertical",
    });

    (!isAndroid) ? table.separatorStyle = Ti.UI.iPhone.TableViewSeparatorStyle.NONE : null;

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
        var rowHeight = Math.floor((ph - headerHeight - runningStringHeight) / 4);
        var top = (rowHeight - 30) / 2;

        var menuItem = Ti.UI.createView({
            height : "25%",
            backgroundImage : '/images/i1_0/menu_row.png',
            //top : btnCounter * rowHeight
        })

        menuItem.add(Ti.UI.createView({
            backgroundImage : '/images/i1_0/arrow.png',
            width : 11,
            height : 16,
            right : 5
        }));

        var icoNum = btnCounter + 1;
        var icoPath = '/images/i1_0/icons/menu_row' + icoNum + '_ico.png';

        menuItem.add(Ti.UI.createView({
            left : 11,
            width : 66,// * delta,
            height : 66,// * delta,
            backgroundImage : icoPath
        }));
        
        var holder = Ti.UI.createView({
            left : 88,
            layout : 'vertical',
            height : Ti.UI.SIZE,
        });

        var lbl = Ti.UI.createLabel({
            left : 0,
            text : textId,
            font : {
                fontWeight : 'bold',
                fontSize: "16dip"
            },
            color : '#ffffff',
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
        });
        holder.add(lbl);

        holder.add(Ti.UI.createLabel({
            left : 0,
            text : text2Id,
            font : {
                fontSize: "12dip"
            },
            color : '#ffffff',
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
        }));
        menuItem.add(holder);
        
        var nearest = Ti.UI.createLabel({
            right : 6,
            bottom : 6,
            text : "",
            height : "12dp",
            wordWrap : false, 
            font : {
                fontSize: "10dip"
            },
            color : '#dddddd',
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            width: "70%",
        });
        menuItem.add(nearest);

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
            }, 500);
        });
        
        menuItem.addNearestText = function( text ) {
            nearest.text = text;
        };

        return menuItem;
    };

    self.add(headerView);
    self.add(table);
    self.add(footerView);

    var miAZS = new MenuItem(L('mi_azs'), L('mi_azs_hint'), 'openListWindow', 2, true);
    var miKart = new MenuItem(L('mi_kart'), L('mi_kart_hint'), 'openListWindow', 3, true);
    var miOpt = new MenuItem(L('mi_opt'), L('mi_opt_hint'), 'openListWindow', 1);
    var miRash = new MenuItem(L('mi_rashod'), L('mi_rashod_hint'), 'openListWindow', 4);
    table.add(miAZS);
    table.add(miKart);
    table.add(miOpt);
    table.add(miRash);
    
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
       color: "#2f7fc3",
       font: {
           fontSize: "16dp",
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
        miKart.addNearestText(Ti.App.nearestStation.addr +  " (" + Ti.App.nearestStation.distance.toFixed(1) + "км)");
        miOpt.addNearestText(Ti.App.nearestStation.addr + " (" + Ti.App.nearestStation.distance.toFixed(1) + "км)");
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
