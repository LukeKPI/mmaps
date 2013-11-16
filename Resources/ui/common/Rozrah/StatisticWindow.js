var UI = require('/ui/common/UI');
var _ = require('libs/underscore-min');
var moment = require('libs/moment');
var Data = require('/models/Data');

function StatisticWindow() {
    var self = Ti.UI.createWindow({
        backgroundImage : "/images/list_bg.png",
    });
    var mode = "stat";

    var lang = Ti.Locale.currentLanguage;

    if (lang == 'ua') {
        moment.lang(lang, require('libs/moment-' + lang));
    } else {
        moment.lang('ru', require('libs/moment-ru'));
    }

    //header
    var header = new UI.WindowHeader({
        has_back : 1,
        title : L('stat_header'),
        right_button : true
    });
    self.add(header);
    //back
    self.clickBack = function() {
        if (mode == "stat") {
            Ti.App.fireEvent('showFirstTab');
        } else {
            header.setTitle(L('stat_header'));
            UI.replaceView(holder, table, null, null, true);
            mode = 'stat';
            bbIndex = 0;
            bottomBar.buttonBarIndex(0);
        }
    };
    header.addEventListener("back", self.clickBack);
    self.addEventListener("backButtonClicked", self.clickBack);
    header.addEventListener("rightBtnTap", function() {
        Ti.App.fireEvent('openSelectWindow');
    });
    //holder
    var holder = Ti.UI.createView({
        top : UI.size.header,
        bottom : UI.size.footer
    });
    self.add(holder);
    //tableView
    var table = Ti.UI.createTableView({
        backgroundColor : 'transparent',
        separatorStyle : UI.isAndroid ? null : Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
    });
    refreshStat(table);

    holder.add(table);
    //bottomBar
    var bottomBar = new UI.WindowFooter({
        button_bar : [L('statistic'), L('zapravki')],
        left_button : true
    });
    //RefuelView
    var RefuelView = require('/ui/common/Rozrah/RefuelView');
    var refuelView = new RefuelView();

    var bbIndex = 0;
    bottomBar.addEventListener('changeMode', function(e) {
        if (bbIndex == e.index)
            return;
        bbIndex = e.index;
        if (e.index == 1) {
            header.setTitle(L('stat2_header'));
            UI.replaceView(holder, refuelView);
            mode = 'fuel';
        } else {
            header.setTitle(L('stat_header'));
            UI.replaceView(holder, table, null, null, true);
            mode = 'stat';
        }
    });
    bottomBar.addEventListener('leftBtnTap', function(e) {
        var dialog = Ti.UI.createAlertDialog({
            cancel : 1,
            buttonNames : [L('confirm'), L('cancel')],
            message : L('rashod_delete'),
            title : L('delete')
        });
        dialog.addEventListener('click', function(e) {
            if (e.index === e.source.cancel) {
                return;
            }
            /*
             if (mode === 'stat') {
             Ti.App.Properties.setString('stats', '')
             } else {*/
            Data.saveRashodData([]);
            self.fireEvent('refresh');
            
            var reloaddialog = Ti.UI.createAlertDialog({
                cancel : 1,
                buttonNames : [L('confirm'), L('cancel')],
                message : L('rashod_example'),
                title : L('delete')
            });
            reloaddialog.addEventListener('click', function(e) {
                if (e.index === e.source.cancel) {
                    return;
                }
                var data = Data.readDefaultRashodData();
                Data.saveRashodData(data);
                self.fireEvent('refresh');
            });
            reloaddialog.show();

            //}
        });
        dialog.show();
    });
    self.add(bottomBar);

    self.addEventListener('refresh', function(e) {
        if (e.showRefuelList) {
            header.setTitle(L('stat2_header'));
            UI.replaceView(holder, refuelView, true);
            mode = 'fuel';
            bbIndex = 1;
            bottomBar.buttonBarIndex(1);
        }
        refuelView.fireEvent('refreshRefuel');
        refreshStat(table);
    });

    return self;
}

function makeTableRows(data) {
    var rows = [];
    _.each(data, function(rec, i) {
        rows.push(new Row(rec));
    })

    return rows;
}

function Row(data) {
    var row = Ti.UI.createTableViewRow({
        height : 66,
        width : '100%',
        backgroundImage : '/images/list_item_bg.png',
    });

    var dateStyle = {
        left : 11,
        height : 66,
        textAlign : 'center',
        font : {
            fontSize : '13dp'
        },
        color : '#2e70ae'
    }
    var iconStyle = {
        width : 11,
        height : 17,
        image : '/images/i4_1/gas.png',
    }
    var lblStyle = {
        textAlign : 'right',
        wordWrap : false,
        height : 33,
        font : {
            fontSize : '13dp'
        },
        color : '#2e70ae'
    }

    var fromToLabel = Ti.UI.createLabel(_.extend(dateStyle, {
        text : moment(data.from, "YYYY-MM-DD").format('DD-MMM') + ' - ' + moment(data.to, "YYYY-MM-DD").format('DD-MMM'),
        top : 0,
    }));

    var bulkLabel = Ti.UI.createLabel(_.extend(lblStyle, {
        text : data.bulk + ' л.',
        right : '40%',
        left : '23%',
        top : 3,
    }));
    var distLabel = Ti.UI.createLabel(_.extend(lblStyle, {
        text : data.dist + ' км.',
        right : 22,
        top : 3,
        left : '70%'
    }));
    var totalLabel = Ti.UI.createLabel(_.extend(lblStyle, {
        text : (data.bulk/(data.dist/100)).toFixed(2) + ' л/100км',
        right : '40%',
        left : '23%',
        top : 30,
        font : {
            fontSize : '13dp',
            //fontWeight : 'bold'
        }
    }));
    var priceLabel = Ti.UI.createLabel(_.extend(lblStyle, {
        text : data.price + ' грн/км',
        right : 22,
        left : '70%',
        top : 30,
        font : {
            fontSize : '13dp',
            fontWeight : 'bold'
        }
    }));

    var bulkIcon = Ti.UI.createImageView(_.extend(iconStyle, {
        right : '35%',
        top : 11,
        image : '/images/i4_common/rashod/fuel.png',
    }));
    var distIcon = Ti.UI.createImageView(_.extend(iconStyle, {
        right : 6,
        top : 11,
        image : '/images/i4_common/rashod/highway.png',
    }));
    var totalIcon = Ti.UI.createImageView(_.extend(iconStyle, {
        right : '35%',
        top : 40,
        image : '/images/i4_common/rashod/highway.png',
    }));
    var priceIcon = Ti.UI.createImageView(_.extend(iconStyle, {
        right : 6,
        top : 40,
        image : '/images/i4_common/rashod/moneybox.png',
    }));

    row.add(fromToLabel);

    row.add(bulkLabel);
    row.add(distLabel);
    row.add(totalLabel);
    row.add(priceLabel);

    row.add(bulkIcon);
    row.add(distIcon);
    row.add(totalIcon);
    row.add(priceIcon);

    return row;
}

function refreshStat(table) {
    var records = Data.readRashodData();
    //alert(records)

    records = UI.sortByDate(records);

    var newData = createData(records);

    var rows = makeTableRows(_.clone(newData));
    table.setData([]);
    table.setData(rows);
}

function createData(recs) {
    var result = [];
    var tmp = {};

    if (recs.length <= 1)
        return;
    recs.reverse();
    _.each(recs, function(rec, i) {
        if (rec.isFull && !tmp.from) {
            init(rec);
            //first rec;
            tmp.bulk = 0;
            tmp.total = 0;
            return;
        } else if (rec.isFull) {
            tmp.to = rec.date
            inc(rec);
            tmp.dist = parseInt(rec.odometr) - parseInt(tmp.dist);
            if (tmp.dist <= 0) {
                tmp.dist = 1;
                tmp.price = 1
            } else {
                tmp.price = parseFloat(tmp.total) / parseInt(tmp.dist);
                tmp.price = tmp.price.toFixed(2);
            }

            tmp.bulk = tmp.bulk.toFixed(2);
            tmp.total = tmp.total.toFixed(2);

            //alert(tmp);
            //if (tmp.from != tmp.to)
            result.push(tmp);
            tmp = {};
            init(rec);
            tmp.bulk = 0;
            tmp.total = 0;
            return;
        }

        inc(rec);
    })
    function init(rec) {
        tmp.from = rec.date;
        tmp.bulk = rec.liters;
        tmp.dist = rec.odometr;
        tmp.total = rec.total;
        tmp.price = rec.price;
    }

    function inc(rec) {
        tmp.bulk = parseFloat(tmp.bulk) + parseFloat(rec.liters);
        tmp.total = parseFloat(tmp.total) + parseFloat(rec.total);
    }

    return result.reverse();
}

module.exports = StatisticWindow;
