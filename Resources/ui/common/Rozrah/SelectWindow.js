var Data = require('/models/Data');
var models = Data.models;
var moment = require('libs/moment');
var UI = require('/ui/common/UI');
var _ = require('libs/underscore-min');
var android = (Ti.Platform.osname == 'android') ? 1 : 0;
/*
 * SYNOPSIS
 *
 * var rec = {
 *      date: new Date(),
 *      odometr: 1234454,
 *      fuel_code: 'a95e',
 *      liters: 12.5,
 *      price_liter: 10.11
 *      price_total: 10.11 * 12.5
 *      is_full: false
 * }
 *
 * var sw = new SelectWindow();
 * sw.addEventListener("edited", function(e){
 *     var record = e.record;
 *
 * });
 * //sw.createNewRecord();
 * sw.editRecord(rec);
 * sw.open();
 *
 *
 *
 */
var rowIndex = null;
var isNew = false;
var editedID = 0;

function SelectWindow(params) {
    var self = Ti.UI.createWindow({
        backgroundImage : "/images/list_bg.png",
    });
    //alert(params.index)
    var currentEditor = null;
    var header = new UI.WindowHeader({
        has_back : true,
        title : L('select_header'),
        right_button : true,
        right_image : '/images/ui/info.png'
    });

    header.addEventListener('rightBtnTap', function(e) {
        Ti.App.fireEvent('openInfoWindow');
    });
    header.addEventListener("back", function() {
        Ti.App.fireEvent('closeSelectWindow');
        if (android) {
            Ti.UI.Android.hideSoftKeyboard();
        }

    });
    self.addEventListener("backButtonClicked", function() {
        Ti.App.fireEvent('closeSelectWindow');
        if (android) {
            Ti.UI.Android.hideSoftKeyboard();
        }

    });

    var mainView = Ti.UI.createScrollView({
        top : UI.size.header,
        layout : 'vertical'
    });

    var edited = null;

    self.createNewRecord = function() {
        edited = null;
        isNew = true;
        editedID = 0;
        fillFields();
    };

    self.editRecord = function(rec) {
        edited = _.clone(rec);
        editedID = edited.id;
        isNew = false;
        fillFields();
    };

    self.saveRecord = function() {

        var rec = readFields();

        if (isValid()) {
            self.fireEvent("edited", {
                record : rec,
            });

            var tmp = Ti.App.Properties.getString('odometr', '0');
            if (tmp < rec.odometr) {
                Ti.App.Properties.setString('odometr', rec.odometr);
            }
            self.remove(mainView);
            Ti.App.fireEvent('closeSelectWindow');
        }
    };
    self.deleteRecord = function() {
        var dialog = Ti.UI.createAlertDialog({
            cancel: 1,
            buttonNames: ['Удалить', 'Отмена'],
            message: 'Удалить запись?',
            title: 'Удаление'
          });
          dialog.addEventListener('click', function(e){
            if (e.index === 0 ){
                var rec = readFields();
        
                self.fireEvent("removed", {
                    record : rec,
                });
                self.remove(mainView);
                Ti.App.fireEvent('closeSelectWindow');
            }
          });
          dialog.show();
    };
    function fillFields() {
        if (edited!=null) {
            edited.date = convertDateStr(edited.date);
            fldDeleteButton.show();
        } else {
            var fuelName = Ti.App.Properties.getString('fuel', models.fuel.getList()[0][0].name);
            var fuelCode = models.fuel.getCodeByName(fuelName);
            var price = parseFloat(findPrice(fuelCode)).toFixed(2);
            var odometr = getOdometrValue();
            //Ti.App.Properties.getString('odometr', '');
            Ti.API.info(getOdometrValue());

            edited = {
                date : new Date(),
                odometr : odometr,
                fuel : fuelName,
                price : price,
                liters : '',
                total : '',
                isFull : true
            };
            fldDeleteButton.hide();
        }

        fldDate.applyValue(edited.date);
        fldFuel.applyValue(edited.fuel);
        fldPrice.applyValue(edited.price);
        fldOdometr.applyValue(edited.odometr);
        fldLiters.applyValue(edited.liters);
        fldTotal.applyValue(edited.total);
        fldSwitch.applyValue(edited.isFull);
    }

    function readFields() {
        var rec = {};

        rec.date = fldDate.readValue();
        rec.odometr = fldOdometr.readValue();
        rec.fuel = fldFuel.readValue();
        rec.price = fldPrice.readValue();
        rec.liters = fldLiters.readValue();
        rec.total = fldTotal.readValue();
        rec.isFull = fldSwitch.readValue();

        return _.extend(edited, rec);
    }

    function isValid() {
        var err = false;
        for (var i = 0; i < editors.length; i++) {
            if (!editors[i].isValid()) {
                //Ti.API.info('isNotValid ' + i);
                editors[i].backgroundColor = 'red';
                err = true;
                return false;
            } else {
                //Ti.API.info('isValid ' + i);
                if (editors[i].backgroundColor == 'red') {
                    editors[i].backgroundColor = 'transparent'
                }
            }
        };
        //Ti.API.info('ERRORS? - ' + err)

        if (!err)
            return true;
    }

    //CREATE FORM UI
    var editors = [];
    /*
     * Editor:
     * applyValue(v)
     * readValue()
     * isValid()
     * showError(txt)
     *
     */
    var rowOptions = {
        //backgroundColor : 'white',
        height : android ? 44 : 44,
        top : UI.isTablet ? 11 : null
    };

    var fldDate = new DateFieldRow(rowOptions, {
        text : L("select_date")
    }, {});
    var fldFuel = new FuelFieldRow(rowOptions, {
        text : L("select_fuel")
    }, {});
    fldFuel.addEventListener('valueChanged', function(e) {
        var fuelCode = models.fuel.getCodeByName(e.value);
        var price = findPrice(fuelCode);
        fldPrice.applyValue(price);

        var liters = parseFloat(fldLiters.readValue());
        var total = parseFloat(fldTotal.readValue());
        var price = fldPrice.readValue();

        if (fldTotal.isValid(true) && price) {
            fldLiters.applyValue((total / price).toFixed(1));
        } else if (fldLiters.isValid(true) && price) {
            fldTotal.applyValue((liters * price).toFixed(1));
        }
    });
    var fldPrice = new EditFieldRow(rowOptions, {
        text : L("fuel_price")
    }, {

    });
    fldPrice.addEventListener('valueChanged', function(e) {
        var price = e.value;

        var liters = parseFloat(fldLiters.readValue());
        var total = parseFloat(fldTotal.readValue());

        if (fldTotal.isValid(true) && price) {
            fldLiters.applyValue((total / price).toFixed(1));
        } else if (fldLiters.isValid(true) && price) {
            fldTotal.applyValue((liters * price).toFixed(1));
        }
    });
    var fldOdometr = new EditFieldRow(rowOptions, {
        text : L('enter_odometr')
    }, {
        hintText : L('hint_odometr')
    });
    fldOdometr.type = 'odometr';

    var fldLiters = new EditFieldRow(rowOptions, {
        text : L('enter_liters')
    }, {
        hintText : L('hint_bulk')
    });
    fldLiters.addEventListener('valueChanged', function(e) {
        var price = fldPrice.readValue();
        if (!price || !fldLiters.isValid(true))
            return;
        var value = (e.value * price).toFixed(2);
        fldTotal.applyValue(value);
    });

    var fldTotal = new EditFieldRow(rowOptions, {
        text : L('enter_total')
    }, {
        hintText : L('hint_total')
    });
    fldTotal.addEventListener('valueChanged', function(e) {
        var price = fldPrice.readValue();
        if (!price || !fldTotal.isValid(true))
            return;
        var value = (e.value / price).toFixed(1);
        fldLiters.applyValue(value);
    });
    var fldSwitch = new SwitchFieldRow(rowOptions, {
        text : L('is_full')
    }, {
        titleOn : "Полный бак",
        titleOff : "Дозаправка"
    });
    var fldButton = new ButtonFieldRow(rowOptions, {
        titleid : 'save',
        
    }, function(e) {
        self.saveRecord();
    });
    var fldDeleteButton = new ButtonFieldRow(rowOptions, {
        titleid : 'delete',
        backgroundImage : "/images/ui/big_button_red.png",
        backgroundSelectedImage : null,
    }, function(e) {
        self.deleteRecord();
    });

    editors.push(fldDate);
    editors.push(fldOdometr);
    editors.push(fldFuel);
    editors.push(fldPrice);
    editors.push(fldLiters);
    editors.push(fldTotal);
    editors.push(fldSwitch);

    mainView.add(fldDate);
    mainView.add(fldOdometr);
    mainView.add(fldFuel);
    mainView.add(fldPrice);
    mainView.add(fldLiters);
    mainView.add(fldTotal);
    mainView.add(fldSwitch);
    mainView.add(fldButton);
    mainView.add(fldDeleteButton);

    //

    if (UI.isTablet && !UI.isAndroid) {
        self.title = L('select_header');

        var cancelBtn = Ti.UI.createButton({
            title : L('cancel')
        });
        cancelBtn.addEventListener('click', function() {
            self.remove(mainView);
            Ti.App.fireEvent('closeSelectWindow');
        });
        self.leftNavButton = cancelBtn;

        mainView.top = 46;

        mainView.width = 320;
        mainView.height = 520;
    } else {
        self.add(header);
    }
    self.add(mainView);

    return self;
}

/*
 *
 * ROW CLASSES
 *
 */

var defaultLabel = {
    left : 11,
    textAlign : "right",
    width : "35%",
    color : "black",
    height : android ? 40 : 30,
    font : android ? {} : {
        fontSize : "14dp",
        fontFamily : "Helvetica",
    },
};

var defaultField = {
    left : '40%',
    backgroundColor : "white",
    borderColor : "#4c4c4c",
    borderRadius : 6,
    borderWidth : 2,
    paddingLeft : android ? 0 : 10,
    //returnKeyType : Ti.UI.RETURNKEY_NEXT,
    right : 11,
    height : android ? 36 : 30,
    font : android ? {} : {
        fontSize : "14dp",
        fontFamily : "Helvetica",
    },
};

var defaultFieldLabel = {
    left : '40%',
    backgroundColor : "white",
    borderColor : "#4c4c4c",
    borderRadius : 6,
    borderWidth : 2,
    right : 11,
    color : "black",
    height : android ? 40 : 30,
    font : {
        fontSize : "14dp",
        fontFamily : "Helvetica",
    },
};
var defaultPickerLabel = {
    left : '40%',
    backgroundImage : "/images/ui/dd.png",
    width : 156,
    height : 36,
    color: "black",
    font : {
        fontSize : "14dp",
        fontFamily : "Helvetica",
    },
};

function DateFieldRow(viewOpts, lo, fo) {

    if (android) {
        var self = Ti.UI.createView(viewOpts);
        self.height = 48 * 3;
        var fld = self.fld = Ti.UI.createPicker(_.extend({
            color: "black",
            left : 11,
            right : 11,
            type : Ti.UI.PICKER_TYPE_DATE,
            value : value,
        }, fo));

        var value = self.value = new Date();
        self.applyValue = function(v) {
            self.value = v;
            fld.value = v;
        };

        self.readValue = function() {
            function addZero(v) {
                return (v < 10) ? '0' + v : v;
            }

            var tmp = fld.value, month = tmp.getMonth() + 1;
            var date = tmp.getFullYear() + '-' + addZero(month) + '-' + addZero(tmp.getDate());

            return date;
        }

        self.isValid = function() {
            if ((new Date() - self.value) < 0) {
                alert(L('err_greater_date'))
                return false;
            }
            return true;
        }
        self.add(fld);
        return self;

    }
    var DatePicker = require('ui/common/Rozrah/DatePicker');

    var self = new PickerFieldRow(viewOpts, lo, fo, DatePicker)

    self.applyValue = function(v) {
        self.value = v;
        self.field.text = "    " + String.formatDate(v);
    };

    self.readValue = function() {
        function addZero(v) {
            return (v < 10) ? '0' + v : v;
        }

        var tmp = self.value, month = tmp.getMonth() + 1;
        var date = tmp.getFullYear() + '-' + addZero(month) + '-' + addZero(tmp.getDate());

        return date;
    }

    self.isValid = function() {
        /*
         Ti.API.info('>>>>>>>>>>>>')
         Ti.API.info(new Date())
         Ti.API.info(self.value)
         Ti.API.info(new Date() - self.value)
         Ti.API.info('>>>>>>>>>>>>>')*/
        if ((new Date() - self.value) < 0) {
            alert(L('err_greater_date'))
            return false;
        }
        return true;
    }

    return self;
}

function FuelFieldRow(viewOpts, lo, fo) {
    var self;
    if (android) {
        self = Ti.UI.createView(viewOpts);
        var fuels = models.fuel.getList()[0];
        var fuelsH = models.fuel.getList()[1];
        var fuel_code = Ti.App.Properties.getString('fuel', fuels[0].code);
        var picker = Ti.UI.createPicker(_.extend(defaultPickerLabel, fo));
        var lbl = self.lbl = Ti.UI.createLabel(_.extend(defaultLabel, lo));
        var value = self.value = fuel_code;
        function makePickerValues(picker, fuels, fuel_code) {
            for (var i = 0, j = fuels.length; i < j; i++) {
                if (fuels[i].code === fuel_code) {
                    picker.setSelectedRow(0, i);
                }

                var row = Ti.UI.createPickerRow({
                    title : fuels[i].name,
                    code: fuels[i].code,
                })
                items[fuels[i].name] = i;
                picker.add(row);
            }
        }
        picker.addEventListener("change", function(e){
            self.value = e.row.title;
            self.fireEvent("valueChanged", {value: e.row.title});
        });
        var items = {};
        makePickerValues(picker, fuels, fuel_code);
        Ti.API.info('ITEMS ' + JSON.stringify(items));
        self.ritems = items;
        self.picker = picker;
        Ti.API.info('DONE');
        self.applyValue = function(v) {
            Ti.API.info('APPLIED ' + v + " " + items[v]);
            Ti.API.info('ITEMS22222222222222222 ' + JSON.stringify(self.ritems));
            if (!self.ritems[v]) return;
            self.picker.setSelectedRow(0, parseInt(self.ritems[v]));
            self.value = v;
        }

        self.readValue = function() {
            return self.value;
        }

        self.isValid = function() {
            return true;
        }
        self.add(lbl);
        self.add(picker);
    } else {
        var FuelPicker = require('/ui/common/Rozrah/FuelPicker');

        self = new PickerFieldRow(viewOpts, lo, fo, FuelPicker)
    }
    return self;
}

function EditFieldRow(viewOpts, lo, fo) {
    var self = Ti.UI.createView(viewOpts);
    var lbl = self.lbl = Ti.UI.createLabel(_.extend(defaultLabel, lo));
    var value = self.value = "";
    var defValue = self.defValue = "", defSaved = false;
    var edt;
    if (!android) {

        var done = Titanium.UI.createButton({
            systemButton : Titanium.UI.iPhone.SystemButton.DONE
        });
        done.addEventListener("click", function(){
            edt.blur();
        });
        
        var flexSpace = Titanium.UI.createButton({
            systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });        
        edt = Ti.UI.createTextField(_.extend(defaultField, fo, {
             keyboardToolbar: [flexSpace, done],
            keyboardToolbarColor : '#333',
            keyboardToolbarHeight : 40,
            keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD,
        }));
    } else {
        edt = Ti.UI.createTextField(_.extend(defaultField, fo, {
             keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD,
        }));
    }

    edt.addEventListener('blur', function(e) {
        value = e.value;
        self.fireEvent('valueChanged', {
            value : e.value
        });
    });
    edt.addEventListener('return', function(e) {
        value = edt.value;
        edt.blur();
        if (android) {
            Ti.UI.Android.hideSoftKeyboard();
        }
    });
    if (!android) {
    self.addEventListener('singletap', function(e) {
        edt.blur();
        if (android) {
            Ti.UI.Android.hideSoftKeyboard();
        }
    });}

    self.applyValue = function(v) {
        value = v + '';
        edt.value = v;

        if (!defSaved) {
            //Ti.API.info('defSaved=' + v);
            defValue = v;
            defSaved = true;
        }
    }

    self.readValue = function() {
        value = edt.value;
        return edt.value;
    }
    //XXX
    self.isValid = function(hideErr) {

        if (!value || value.length > 7 || value <= 0) {
            if (hideErr)
                return false;
            alert(L('err_null_or_greater'))
            return false;
        }
        /*
         Ti.API.info('######')
         Ti.API.info(value)
         Ti.API.info(typeof value)
         Ti.API.info('######') */

        if (!value.match(/^\d+\.?\d*$/)) {
            if (hideErr)
                return false;
            alert(L('err_signs'))
            return false;
        }

        //Ti.API.info('rowIndex ' + rowIndex)
        if (self.type == 'odometr' && isNew) {
            //Ti.API.info('ShowErr ' + hideErr)

            /*
             Ti.API.info('odometr creating')

             Ti.API.info('################')
             Ti.API.info(self.type)
             Ti.API.info(value)
             Ti.API.info(defValue)
             Ti.API.info(value <= defValue)
             Ti.API.info('################')*/

            if (value <= defValue) {
                if (hideErr)
                    return false;
                var errStr = L('err_odometr') + ' - ' + defValue
                alert(errStr);
                return false;
            }
        } else if (self.type == 'odometr') {
            //Ti.API.info('changing odometr')
            return checkOdometr(value);
        }
        return true;
    }

    self.add(lbl);
    self.add(edt);

    return self;
}

function LabelFieldRow(viewOpts, lo, fo) {
    var self = Ti.UI.createView(viewOpts);

    var lbl = self.lbl = Ti.UI.createLabel(_.extend(defaultLabel, lo));

    var value = self.value = null;

    var fld = self.fld = Ti.UI.createLabel(_.extend(defaultField, fo));

    self.applyValue = function(v) {
        self.value = v ? v : 0;
        fld.text = "    " + self.value;
    }

    self.readValue = function() {
        return self.value;
    }

    self.isValid = function() {

        return true;
    }

    self.add(lbl);
    self.add(fld);

    return self;
}

function PickerFieldRow(viewOpts, lbl, fld, PickerClass) {
    var self = Ti.UI.createView(viewOpts);
    var label = self.lbl = Ti.UI.createLabel(_.extend(defaultLabel, lbl));
    var field = self.field = Ti.UI.createLabel(_.extend(defaultPickerLabel, fld));

    self.add(label);
    self.add(field);

    self.value = null;
    self.applyValue = function(v) {
        self.value = v;
        field.text = "    " + v;
    };

    self.readValue = function() {
        return self.value;
    }

    field.addEventListener("singletap", function(e) {
        //show date picker
        var dp = new PickerClass(self.value);
        dp.addEventListener("done", function(e) {
            self.applyValue(e.value);
            self.fireEvent('valueChanged', {
                value : e.value
            });
        });
        dp.showPicker(self);
    });

    self.isValid = function() {
        return true;
    }

    return self;
}

function SwitchFieldRow(viewOpts, lo, swtch) {
    var self = Ti.UI.createView(viewOpts);
    var lbl = self.lbl = Ti.UI.createLabel(_.extend(defaultLabel, lo));
    var sw = self.sw = Ti.UI.createSwitch(_.extend({
        value : true,
        left : '50%'
    }, swtch));

    self.add(lbl);
    self.add(sw);
    self.value = true;
    self.applyValue = function(v) {
        self.value = !!v;
        sw.value = !!v;
    };

    sw.addEventListener('change', function(e) {
        self.value = e.value;
    });

    self.readValue = function() {
        return self.value;
    }

    self.isValid = function() {
        return true;
    }

    return self;
}

function ButtonFieldRow(viewOpts, bo, callback) {
    var self = Ti.UI.createView(viewOpts);
    self.height = 48;
    var btn = self.btn = Ti.UI.createButton(_.extend({
        width : 281,
        height : 48,
        backgroundImage : "/images/ui/big_button.png",
        backgroundSelectedImage : "/images/ui/big_button_tap.png",
        color : "black",
        font : {
            fontSize : "18dp",
            //fontWeight: "bold",
            fontFamily : "Helvetica",
        }
    }, bo));

    btn.addEventListener('singletap', function(e) {
        callback(e);
    });

    self.add(btn);

    return self;
}

function findPrice(fuelCode) {
    var rec = _.find(models.station.getList(), function(rec, i) {
        return !!rec[fuelCode] == true;
    });

    return rec[fuelCode];
}

function convertDateStr(date) {
    dArr = date.split("-");
    var tmp = new Date();
    tmp.setFullYear(dArr[0]);
    tmp.setMonth(dArr[1] - 1)
    tmp.setDate(dArr[2])
    return tmp;
}

function checkOdometr(value) {
    value = parseFloat(value);
    defValue = parseFloat(value);
    var records = Data.readRashodData();
    records = UI.sortByDate(records);
    for (var i=0; i < records.length; i++) {
        var rec = records[i];
        Ti.API.info('REC ' + rec.id + "  " +rec.odometr);
        if (rec.id == editedID) {
            Ti.API.info('FOUND ' + rec.id + "  " +rec.odometr + " " + value);
            //found.
            //check next
            if (records[i-1] && value >= records[i-1].odometr) {
               alert(L('err_next_odom') + ' - ' + records[i-1].odometr);
               return false;
            }
            if (records[i+1] && value <= records[i+1].odometr) {
               alert(L('err_prev_odom') + ' - ' + records[i+1].odometr);
               return false;
            }
        }
    };    
    return true;
    if (isNew) {
        
    }
    //Ti.API.info('>>>>>>>>>>>>>>>>>>>')
    //Ti.API.info(index)
    if (!isNew) {
        var next = records[index - 1];
        /*
         Ti.API.info('prev')
         //Ti.API.info(prev)
         Ti.API.info(value + ' / ' + prev.odometr)
         Ti.API.info(value <= prev.odometr)*/

        if (value >= next.odometr) {
            //Ti.API.info('return false')
            var errStr = L('err_next_odom') + ' - ' + next.odometr
            alert(errStr);
            return false;
        }
    }
    if (!isNew && index < records.length - 1) {
        var prev = records[index + 1];
        //Ti.API.info('next')
        //Ti.API.info(next)
        //Ti.API.info(value + ' / ' + next.odometr)
        //Ti.API.info(value >= next.odometr)
        if (value <= prev.odometr) {
            //Ti.API.info('return false')
            var errStr = L('err_prev_odom') + ' - ' + prev.odometr
            alert(errStr);
            return false;
        }
    }

    /*
    if (index == 0 && records.length > 1) {
    Ti.API.info('index==0')
    Ti.API.info('!!################')
    Ti.API.info(value)
    Ti.API.info(defValue)
    Ti.API.info('!!################')
    if (value <= defValue) {
    alert(L('err_odometr'))
    return false;
    }
    }*/

    //Ti.API.info('>>>>>>>>!!!!!!!!!>>>>>>>>')
    return true;
}

function getOdometrValue() {
    var records = Data.readRashodData();
    if (!records.length)
        return '';

    records = UI.sortByDate(records);

    Ti.API.info(records[0])
    
    return records[0].odometr ? records[0].odometr : '';
}

module.exports = SelectWindow;
