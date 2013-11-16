var UI = require('/ui/common/UI');
var _ = require('/libs/underscore-min');
var moment = require('/libs/moment');
var Data = require('/models/Data');

function RefuelView(params) {
    var self = Ti.UI.createView(params);

    var lang = Ti.Locale.currentLanguage;
    Ti.API.info(lang);

    if (lang == 'ua') {
        moment.lang(lang, require('libs/moment-' + lang));
    } else {
        moment.lang('ru', require('libs/moment-ru'));
    }

    var table = Ti.UI.createTableView({
        backgroundColor : 'transparent',
        separatorStyle : UI.isAndroid ? null : Ti.UI.iPhone.TableViewSeparatorStyle.NONE
    });

    refreshRefuel();

    table.addEventListener('click', function(e) {
        //Ti.API.info('click '+e.row.data.date)
        Ti.App.fireEvent('openSelectWindow', {
            record : _.clone(e.row.data),
        });
    })
    function refreshRefuel() {
        table.setData([]);
        var list = Data.readRashodData();
        Ti.API.info('RELOAD LIST');
        var rows = makeTableRows(list);
        table.setData(rows);
    }


    self.addEventListener('refreshRefuel', refreshRefuel);

    self.add(table);
    return self;
}

function makeTableRows(data) {
    var rows = [];

    data = UI.sortByDate(data);

    _.each(data, function(rec, i) {
        rows.push(new Row(rec));
    })

    return rows;
}

function Row(data) {
    var row = Ti.UI.createTableViewRow({
        height : 44,
        width : '100%',
        backgroundImage : '/images/list_item_bg.png',
        hasChild : true,
        data : data
    });

    var dateStyle = {
        left : 0,
        height : 44,
        textAlign : 'center',
        width : '25%',
        color : '#2e70ae'
    }

    var lblStyle = {
        textAlign : 'center',
        wordWrap : false,
        height : 44,
        font : {
            fontSize : '11dp'
        },
        width : '25%',
        color : '#2e70ae'
    }

    var dateLabel = Ti.UI.createLabel(_.extend(dateStyle, {
        text : moment(data.date, "YYYY-MM-DD").format('DD MMM YYYY'),
        font :  data.isFull ?         {
            fontSize : '10dp',
            fontWeight: "bold"
        } :  {
            fontSize : '10dp'
        }
    }));

    var fuelLabel = Ti.UI.createLabel(_.extend(lblStyle, {
        text : data.odometr,
        left : '25%'
    }));

    var bulkLabel = Ti.UI.createLabel(_.extend(lblStyle, {
        text : data.liters + ' л.',
        left : '50%'
    }));

    var priceLabel = Ti.UI.createLabel(_.extend(lblStyle, {
        text : data.total + ' грн',
        left : '75%',
        font : {
            fontSize : '11dp',
            fontWeight : 'bold'
        }
    }));

    row.add(dateLabel);
    row.add(fuelLabel);
    row.add(bulkLabel);
    row.add(priceLabel);

    Ti.API.info('date refuel - ' + row.data.date)
    return row;
}

module.exports = RefuelView;
