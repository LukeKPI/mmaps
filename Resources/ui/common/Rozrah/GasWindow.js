var Data = require('/models/Data'), android = (Ti.Platform.osname == 'android') ? 1 : 0;

function GasWindow(fuel) {
    //create component instance
    var self = Ti.UI.createWindow({
        navBarHidden : false,
        backgroundColor : '#ffffff',
        barColor : '#0c4e8d',
        title : L('rozrah_gas_title')
    });
    if (android) {
        self.navBarHidden = true;
    }

    var tData = [];
    var active;

    var data = models.fuel.getList();
    var fuels = [];

    for (var i = 0; i < data.length; i++) {
        fuels.push({
            title : data[i].name
        });
    }

    tData = fuels;

    var table = Ti.UI.createTableView();

    table.addEventListener('click', function(e) {
        if (!e.row.hasCheck) {
            e.row.hasCheck = true;
            active.hasCheck = false;
            active = e.row;
        }
    });

    var btnSave = Ti.UI.createButton({
        title : L('select')
    });
    if (!android) {
        btnSave.style = Ti.UI.iPhone.SystemButton.DONE;
    }

    var btnCancel = Ti.UI.createButton({
        title : L('cancel')
    });
    if (!android) {
        btnCancel.style = Ti.UI.iPhone.SystemButton.DONE;
    }

    btnSave.addEventListener('click', function(e) {
        Ti.App.fireEvent('fuelChecked', {
            fuel : active.title
        });
        Ti.App.Properties.setString('fuelTypeSelected', active.title);
        self.close();

    });

    btnCancel.addEventListener('click', function(e) {
        self.close();
    });

    self.rightNavButton = btnSave;
    self.leftNavButton = btnCancel;
    table.setData(tData);
    var tData = table.data[0].rows;
    for (var i = 0; i < tData.length; i++) {
        if (tData[i].title == fuel) {
            tData[i].hasCheck = true;
            active = tData[i];
            break;
        } else {
            active = tData[i];
        }
    }

    self.add(table);

    return self;
}

module.exports = GasWindow;
