var UI = require('/ui/common/UI');
/*
 * SINOPSIS
 *
 * var dt = new DatePicker();
 * dt.applyValue(new Date());
 *
 * dt.fireEvent(done, function() {
 *     value : date
 * })
 *
 */

function DatePicker(date) {
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

    var date = date || new Date();

    self.addEventListener('singletap', function() {
        return;
    })
    var bg = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0.3
    })

    var minDate = new Date();
    minDate.setFullYear(2012);
    minDate.setMonth(0);
    minDate.setDate(1);

    var maxDate = new Date();
    maxDate.setFullYear(2030);
    maxDate.setMonth(11);
    maxDate.setDate(31);

    self.applyValue = function(v) {
        date = v;
        picker.value = date;
    };

    var picker = Ti.UI.createPicker({
        type : Ti.UI.PICKER_TYPE_DATE,
        minDate : minDate,
        maxDate : maxDate,
        value : date,
        bottom : 0,
        width : '100%'
    });

    picker.addEventListener('change', function(e) {
        date = e.value;
    });

    picker.selectionIndicator = true;

    var tb = createToolbar(picker.height, picker.width, function() {
        self.fireEvent('done', {
            value : date
        });
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

module.exports = DatePicker;
