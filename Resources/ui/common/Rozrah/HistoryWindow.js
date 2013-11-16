function HistoryWindow() {
    var ai = require('/ui/common/AIWindow'),
        android = (Ti.Platform.osname == 'android') ? 1 : 0

    //create component instance
    var self = Ti.UI.createWindow({
        title : L('rozrah_history_title'),
        navBarHidden : false,
        backgroundColor : '#ffffff',
        layout : 'vertical',
        backgroundImage : '/images/i4_2/back.png',
        barColor : '#0c4e8d'
    });
    if (android) {
        self.navBarHidden = true;
    }

    var table = Ti.UI.createTableView();
    var data = [];
    //Ti.App.Properties.setString('history', '');
    if (Ti.App.Properties.getString('history')) {
        var list = Ti.App.Properties.getString('history');
        list = eval(list);
        if (list)
            list.reverse();

        for (var i = 0; i < list.length; i++) {
            var lblConsumption = Ti.UI.createLabel({
                text : list[i].consumption,
                font : {
                    fontSize: "14dip"
                },
                width : 130,
                left : 90
            });
            var lblFuel = Ti.UI.createLabel({
                text : list[i].fuel,
                font : {
                    fontSize: "14dip"
                },
                right : 10,
                color : '#0a4780'
            });

            var row = Ti.UI.createTableViewRow({
                title : list[i].date,
                color : '#3288d4',
                font : {
                    fontSize: "14dip"
                },
                height : 50,
                backgroundColor : 'transparent',
                backgroundImage : '/images/i4_2/row.png'
            });

            switch(list[i].type) {
                case 'Город':
                    row.rightImage = '/images/i4_common/city.png';
                    break;
                case 'Трасса':
                    row.rightImage = '/images/i4_common/highway.png';
                    break;
                case 'Mix':
                    row.rightImage = '/images/i4_common/mix.png';
                    break;
            }

            row.add(lblConsumption);
            row.add(lblFuel);

            data.push(row);
        }
    } else {
        data.push({
            title : L('no_history')
        });
    }

    var btnClear = Ti.UI.createButton();
    if (!android) {
        btnClear.systemButton = Ti.UI.iPhone.SystemButton.TRASH;
    }

    btnClear.addEventListener('click', function(e) {
        Ti.App.Properties.setString('history', '');
        table.setData([{
            title : L('no_history')
        }]);
        ai.show({
            msg : true,
            title : L('cleared'),
            autohide : true
        });
    });

    if (android) {
        var topView = Ti.UI.createView({
            top : 0,
            height : 44,
            width : Ti.UI.FILL,
            backgroundImage : '/images/i1_2/bottom_back.png'
        });
        btnClear.title = L('clear');
        btnClear.right = 5;
        //table.top = 44;

        topView.add(btnClear);
        self.add(topView);
    } else {
        self.rightNavButton = btnClear;
    }

    table.setData(data);
    self.add(table);

    return self;
}

module.exports = HistoryWindow;
