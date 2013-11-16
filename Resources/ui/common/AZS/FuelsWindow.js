var UI = require('/ui/common/UI');
var rowHeight = UI.isTablet ? 66 : 44, rowLimit = android ? 20 : 20;
var android = (Ti.Platform.osname == 'android') ? 1 : 0;
var Data = require('/models/Data');
var _ = require('/libs/underscore-min');
function makeTableData(data) {
    var list = [];

    for (var i = 0; i < data.length; i++) {
        var row = {
            title : data[i].name,
            leftImage : UI.isTablet ?'/images/fuels/'+data[i].code+'@2x.png' :'/images/fuels/'+data[i].code+'.png',
            className: 'fuel',
            height : rowHeight,
            color : '#0a4882',
            font : {
                fontSize : "18dip",
                fontWeight : "bold"
            },
            shadowColor : "#e7e7e8",
            backgroundImage : '/images/list_item_small.png',
            fuel : data[i],
        };

        list.push(row);
    }

    return list;
}


function FuelsWindow() {
    var android = (Ti.Platform.osname === 'android') ? 1 : 0;
    
    var self = Ti.UI.createWindow({
        backgroundImage: '/images/list_bg.png',
        navBarHidden : true
    });
    
    var header = new UI.WindowHeader({
        has_back : 1,
        right_button_ok : 1
    });
    self.clickBack = function() {
        if (checkedFuels.length) {
            Ti.App.fireEvent('openListWindow', {
                fuels : checkedFuels
            });
        }
        self.close();
    };
    self.selectAll = function() {
        _.each(table.data[0].rows, function(row) {
            row.hasCheck = true;
            checkedFuels.push(row.fuel.code);    
        });
    };
    self.selectNone = function() {
        _.each(table.data[0].rows, function(row) {
            row.hasCheck = false;    
        });
        checkedFuels = [];
    };

    header.addEventListener("back", self.clickBack);
    header.addEventListener("select_all", self.selectAll);
    header.addEventListener("select_none", self.selectNone);

    
    var checkedFuels = [];

    var table = Ti.UI.createTableView({
        top: UI.size.header,
        rowHeight : rowHeight,
        backgroundColor : 'transparent',
        separatorColor : 'transparent',
    });

    table.addEventListener('click', function(e) {
        var fuelRec = e.rowData.fuel;
        e.rowData.hasCheck = !e.rowData.hasCheck;
        
        if (!e.rowData.hasCheck) {
            checkedFuels = _.without(checkedFuels, fuelRec.code);
        } else {
            checkedFuels.push(fuelRec.code);
        }
        Ti.API.info(checkedFuels);
    });

    self.add(header);
    self.add(table);

    var data = Data.models.fuel.getList()[0];
    if (data) {
        var list = makeTableData(data);
        table.setData(list);
    }
    return self;
}

module.exports = FuelsWindow;
