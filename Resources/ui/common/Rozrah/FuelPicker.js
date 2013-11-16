var UI = require('/ui/common/UI');
var Data = require('models/Data');
models = Data.models;

function FuelPicker(defFuel) {
    var self;
    if (UI.isTablet) {
        self = Ti.UI.iPad.createPopover({
            title : L('choose'),
            height : Ti.UI.SIZE,
            width : 320
        });
    } else {
        self = Ti.UI.createWindow({
            title : L('choose'),
            backgroundColor : 'transparent'
        })
    }

    var bg = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0.3
    })

    var fuel = defFuel || models.fuel.getList()[0][0].name;

    var picker = Ti.UI.createPicker({
        width : '100%',
        useSpinner : true,
        bottom : 0,
    });

    makePickerValues(fuel);

    picker.addEventListener('change', function(e) {
        fuel = e.row.title;
    });

    picker.selectionIndicator = true;

    var tb = createToolbar(picker.height, picker.width, function() {
        self.fireEvent('done', {
            value : fuel
        });
        Ti.App.Properties.setString('fuel', fuel);
        if (UI.isTablet) {
            self.hide();
            return;
        }
        self.close();
    }, function() {
        if (UI.isTablet) {
            self.hide();
            return;
        }
        self.close();
    });

    if (!UI.isTablet) {
        self.add(bg);
    } else {
        tb.top = 0;
        picker.top = 44;
        picker.bottom = null;
    }
    self.add(picker);
    self.add(tb);

    //

    function makePickerValues() {
        var fuels = models.fuel.getList()[0]

        for (var i = 0, j = fuels.length; i < j; i++) {
            if (fuels[i].name === fuel) {
                picker.setSelectedRow(0, i);
            }

            var row = Ti.UI.createPickerRow({
                title : fuels[i].name
            })
            picker.add(row);
        }
    }


    self.showPicker = function(view) {
        if (UI.isTablet) {
            self.show({
                view : view
            });
        } else {
            self.open({
                animated : false
            });
        }
    }

    return self;
}

module.exports = FuelPicker;

function createToolbar(height, width, onDone, onCancel) {
    var cancel = Titanium.UI.createButton({
        title : L('cancel'),
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    cancel.addEventListener('click', onCancel);

    var done = Titanium.UI.createButton({
        title : L('done'),
        style : Titanium.UI.iPhone.SystemButtonStyle.DONE
    });

    done.addEventListener('click', onDone);

    var spacer = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

    var toolbar = Ti.UI.iOS.createToolbar({
        bottom : height,
        width : width,
        items : [cancel, spacer, done]
    });

    return toolbar;
}