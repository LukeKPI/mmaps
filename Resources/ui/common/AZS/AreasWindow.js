var Data = require('/models/Data');
var UI = require('/ui/common/UI');
var rowHeight = UI.isTablet ? 66 : 44;
var android = (Ti.Platform.osname == 'android') ? 1 : 0;

function makeTableData(data) {
    var list = [{
            hasChild : true,
            className: "standard_region",
            title : L('all'),
            height : rowHeight,
            color : '#0a4882',
            font : {
                fontSize : "18dip",
                fontWeight : "bold"
            },
            shadowColor : "#e7e7e8",
            shadowOffset : {
                x : 0,
                y : 1
            },
            backgroundImage : '/images/list_item_small.png',
            area : {region_id:data[0].region_id, all:1},
        }];

    for (var i = 0; i < data.length; i++) {
        var row = {
            hasChild : true,
            className: "standard_region",
            title : (UI.isUk) ?data[i].name_ua :data[i].name,
            height : rowHeight,
            color : '#0a4882',
            font : {
                fontSize : "18dip",
                fontWeight : "bold"
            },
            shadowColor : "#e7e7e8",
            shadowOffset : {
                x : 0,
                y : 1
            },
            backgroundImage : '/images/list_item_small.png',
            area : data[i],
        };

        list.push(row);
    }

    return list;
}

function AreasWindow(callback) {

    var self = Ti.UI.createView({
        bottom : UI.size.footer,
        backgroundImage: '/images/list_bg.png'
    });

    var table = Ti.UI.createTableView({
        backgroundColor : 'transparent',
        separatorColor : 'transparent',
    });

    table.addEventListener('click', function(e) {
        var areaRec = e.rowData.area;
        callback(areaRec);
    });

    self.addData = function(regionRec) {
        //self.addEventListener('open', function(e) {
        var data = Data.models.area.getListByRegion(regionRec.id);
        if (data) {
            var list = makeTableData(data);
            table.setData(list);
        } else {
            table.setData([]);
        }
    }
    self.add(table);

    return self;
}

module.exports = AreasWindow;
