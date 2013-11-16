var Data = require('/models/Data');
var UI = require('/ui/common/UI');
var rowHeight = UI.isTablet ? 66 : 44;
function makeTableData(data) {
    var list = [];

    for (var i = 0; i < data.length; i++) {
        var row = {
            hasChild : true,
            layout : 'vertical',
            title : (UI.isUk) ?data[i].name_ua : data[i].name,
            className : "standard_region",
            height : rowHeight,
            color : '#0a4882',
            font : {
                fontSize : "18dip",
                fontWeight : "bold"
            },
            shadowColor : "#e7e7e8",
            backgroundImage : '/images/list_item_small.png',
            region : data[i],
        };

        list.push(row);
    }

    return list;
}

function SingleRegionsDesign(self, parent, window) {

    var android = (Ti.Platform.osname == 'android') ? 1 : 0;
    window = (window) ? window : {};

    self.backgroundImage = '/images/list_bg.png';

    var cancelBtn = Ti.UI.createButton({
        title : L('back')
    });

    cancelBtn.addEventListener('click', function(e) {
        Ti.App.fireEvent('closeNavFilter');
    });

    var table = Ti.UI.createTableView({
        rowHeight : 44,
        backgroundColor : 'transparent',
        separatorColor : 'transparent',
    });

    table.addEventListener('click', function(e) {
        var regionRec = e.rowData.region

        Ti.API.info(regionRec);

        var fs = (UI.isUk) ?regionRec.name_ua :regionRec.name ;
        if (!fs.match(/Крым/)) {
            fs += ' обл.';
        }

        if (window.Kart || window.Opt) {
            var pref = window.Kart ? "Kart" : "Opt"; 
            Ti.API.info('SEND FILTER regionID' + regionRec.id)
            Ti.App.fireEvent('filter'+pref+'List', {
                filteringRegionId : regionRec.id
            });

            Ti.App.fireEvent('filter'+pref+'StringShow', {
                filterString : fs
            });
            UI.replaceView(parent, parent.table, false, parent.bottomBar);
            return;
        }
        //AREAS
        var AreasWindow = require('/ui/common/AZS/AreasWindow');
        self.areasWindow = new AreasWindow(regionRec.id, fs, parent, self);

        UI.replaceView(parent, self.areasWindow, false, parent.bottomBar);
        self.area_show_callback();
        self.mode = "areas";
    });

    self.add(table);
    if (!android) {
        self.leftNavButton = cancelBtn;
    }

    var data = Data.models.region.getList();
    if (data) {
        var list = makeTableData(data);
        table.setData(list);
    } else {
        table.setData([{
            title : 'no data in response'
        }]);
    }
}

module.exports = SingleRegionsDesign;
