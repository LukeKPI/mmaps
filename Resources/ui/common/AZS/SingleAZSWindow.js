var Data = require('/models/Data');
var UI = require('/ui/common/UI');

function SingleAZSWindow(e) {
    var data = e.data;
    var android = (Ti.Platform.osname === 'android') ? 1 : 0;

    //create component instance
    var self = Ti.UI.createWindow({
       // navBarHidden : true,
        backgroundColor : '#ffffff',
    });

    var header = new UI.WindowHeader({has_back:1, title:data.brand});
    self.add(header);
    header.addEventListener("back", function(){Ti.App.fireEvent("closeSingleAZSWindow")});
    self.addEventListener("backButtonClicked", function(){Ti.App.fireEvent("closeSingleAZSWindow")});

    var stella = new UI.Stella();
    var info = new UI.StationFooterView();
    stella.addToFooterView(info);
    var prices = new UI.FuelsView(data, Data.models);
    stella.addFuelsList(prices);
    Data.getStationById(data.id, function(success, d) {
        if (success) {
            data = d;
            prices = null;
            prices = new UI.FuelsView(data, Data.models);
            stella.addFuelsList(prices);
        }
    });
    info.addData(data);

    var mapNav = new UI.MapNavigation("azs");
    mapNav.addData(data);
    mapNav.top = 11;
    
    var rightView = Ti.UI.createView({
        height: Ti.UI.SIZE,
        layout: "vertical",
        left: 21,
        right: 4,
        bottom:11,        
    });
    
    
    
    
    var servicesView = Ti.UI.createView({
        top: 11,
        left:0, right:0,
        height: Ti.UI.SIZE,
        //bottom: UI.isTablet ? 50 : 70,
        layout : 'horizontal',
    });

    if (data.services) {
        var arr = data.services.replace(" ", "").split(',');
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                var service = parseInt(arr[i]);
                
                if (!isNaN(service)) {
                    var servIco = Ti.UI.createView({
                        width : UI.isTablet ? 60 : 30,
                        height : UI.isTablet ? 60 : 30,
                        right: 3,
                        bottom: 3
                    });
        
                    servIco.backgroundImage = UI.isTablet ? '/images/services/' + service + '@2x.png' : '/images/services/' + service + '.png';
                    servicesView.add(servIco);
                }
            }
        }
    }

    
    
    var cardsView = Ti.UI.createView({
        bottom: 11,
        layout : 'horizontal',
        height: Ti.UI.SIZE,
        //top : UI.isTablet ? 20 : 40,
        right : 0,
        left:0,
    });
    cardsView.add(Ti.UI.createView({
        backgroundImage : UI.isTablet ? '/images/passport/karta_u@2x.png' : '/images/passport/karta_u.png',
        width : UI.isTablet ? 60 : 40,
        height : UI.isTablet ? 39 : 26
    }));
    cardsView.add(Ti.UI.createView({
        backgroundImage : UI.isTablet ? '/images/passport/karta@2x.png' : '/images/passport/karta.png',
        width : UI.isTablet ? 60 : 40,
        height : UI.isTablet ? 39 : 26,
        left : 2
    }));
    
    rightView.add(cardsView);
    rightView.add(servicesView);
    rightView.add(mapNav);
    stella.addToRightView(rightView);
    self.add(stella);
    
    return self;
}

module.exports = SingleAZSWindow;