var UI = require('/ui/common/UI');

function InfoWindow() {
    var self = Ti.UI.createWindow({
        backgroundImage : "/images/list_bg.png",
        navBarHidden : true
    });

    //header
    var header = new UI.WindowHeader({
        has_back : 1,
        title : L('stat_header')
    });
    self.add(header);
    //back
    self.clickBack = function() {
        Ti.App.fireEvent("closeInfoWindow");
    };
    header.addEventListener("back", self.clickBack);
    self.addEventListener("backButtonClicked", self.clickBack);
    header.addEventListener("rightBtnTap", function() {
        Ti.App.fireEvent('openSelectWindow');
    });

    var view = Ti.UI.createWebView({
        url : '/documents/info.html',
        top : UI.size.header
    });

    self.add(view);

    return self;
}

module.exports = InfoWindow;