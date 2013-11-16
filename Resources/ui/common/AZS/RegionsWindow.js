var UI = require('/ui/common/UI');
var rowHeight = UI.isTablet ? 66 : 44, rowLimit = android ? 20 : 20;
var android = (Ti.Platform.osname == 'android') ? 1 : 0;
var Data = require('/models/Data');
function makeTableData(data) {
    var list = [];

    for (var i = 0; i < data.length; i++) {
        var row = {
            hasChild : true,
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


function RegionsWindow(callback) {
    var android = (Ti.Platform.osname === 'android') ? 1 : 0;
    
    var self = Ti.UI.createView({
        bottom : UI.size.footer,
        backgroundImage: '/images/list_bg.png'
    });

    var table = Ti.UI.createTableView({
        rowHeight : rowHeight,
        backgroundColor : 'transparent',
        separatorColor : 'transparent',
    });

    table.addEventListener('click', function(e) {
        var regionRec = e.rowData.region
        callback(regionRec);
    });

    self.add(table);

    var data = Data.models.region.getList();
    if (data) {
        var list = makeTableData(data);
        table.setData(list);
    }
    return self;
}

module.exports = RegionsWindow;
