var Data = require('/models/Data');
var UI = require('/ui/common/UI');

//for btnEventListener
var currObject, fuels = {}, sFuels = [];
//for getList
var android = (Ti.Platform.osname === 'android') ? 1 : 0;

function NearestWindow(navGroup) {
    //create component instance
    var self = Ti.UI.createWindow({
        //navBarHidden : true,
    });
    var header = new UI.WindowHeader({
        has_back : 1,
        title : L("nearest_azs"),
        right_button:true,
        right_image: '/images/ui/reload.png'
    });
    header.addEventListener("rightBtnTap", function() {
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
            var stations = Data.models.station.getList();
            Ti.App.nearestStation = stations[0];
            prices = new UI.FuelsView(Ti.App.nearestStation, Data.models);
            stella.addFuelsList(prices);
            info.addData(Ti.App.nearestStation);
            nav.addData(Ti.App.nearestStation);
            
            
            
            
        });
    });
    self.add(header);
    self.clickBack = function() {
        Ti.App.fireEvent('showFirstTab');
    };
    header.addEventListener("back", self.clickBack);
    self.addEventListener("backButtonClicked", self.clickBack);
    

    var stella = new UI.Stella();
    var nav = new UI.Navigation(currObject);
    var info = new UI.StationFooterView();
    stella.addToRightView(nav);
    stella.addToFooterView(info);
    self.add(stella);
    var prices;
    self.addEventListener("open", function() {
        if (!Ti.App.nearestStation) {
            var stations = Data.models.station.getList();
            Ti.App.nearestStation = stations[0];
        }
        prices = new UI.FuelsView(Ti.App.nearestStation, Data.models);
        stella.addFuelsList(prices);
        info.addData(Ti.App.nearestStation);
        nav.addData(Ti.App.nearestStation);
    });

    return self;
}

module.exports = NearestWindow;
