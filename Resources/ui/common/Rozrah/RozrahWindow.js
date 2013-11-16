function RozrahWindow() {
    var AIndicator = require('ui/common/AIWindow');
    var android = (Ti.Platform.osname === 'android') ? true : false;
    //Ti.API.info('START')
    //create component instance
    var self = Ti.UI.createWindow({
        title : L('rozrah_calc_title'),
        navBarHidden : false,
        backgroundColor : '#ffffff',
        layout : 'vertical',
        barColor : '#0c4e8d',
        backgroundImage : '/images/i4_1/back.png'
    });
    if (android) {
        self.navBarHidden = true;
    }

    var typeSelected;
    var activeType;

    //section 1
    var section1 = Ti.UI.createTableViewSection({
        footerTitle : ''
    });
    //section1.footerTitle = 'some text';

    //row1 construct
    var row1S1 = Ti.UI.createTableViewRow({
        title : L('rozrah_calc_litr'),
        leftImage : '/images/i4_1/gas.png',
        color : "#000"
    });

    //row1S1.add(lblLitersSelected);
    var txtLitersSelected = Ti.UI.createTextField({
        value : '10',
        right : 30,
        color : '#666',
        keyboardType : Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION
    });
    txtLitersSelected.addEventListener('change', function(e) {
        //alert('OnChange')
        //section1.footerTitle = 'OnChange text'
        getConsumptions();
    });
    if (!android) {
        txtLitersSelected.width = 70;
    } else {
        row1S1.add(Ti.UI.createLabel({
            text : L('rozrah_calc_litr'),
            color : '#000',
            left : 5
        }));

        txtLitersSelected.width = 110;
        txtLitersSelected.maxLength = 5;
    }

    row1S1.add(txtLitersSelected);
    section1.add(row1S1);

    //row2 construct
    var row2S1 = Ti.UI.createTableViewRow({
        title : L('rozrah_calc_mileage'),
        leftImage : '/images/i4_1/car.png',
        color : "#000"
    });

    var txtMileageSelected = Ti.UI.createTextField({
        value : '100',
        right : 30,
        color : '#666',
        keyboardType : Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION
    });
    txtMileageSelected.addEventListener('change', function(e) {
        getConsumptions();
    });

    if (!android) {
        txtMileageSelected.width = 70;
    } else {
        row2S1.add(Ti.UI.createLabel({
            text : L('rozrah_calc_mileage'),
            color : '#000',
            left : 5
        }))

        txtMileageSelected.width = 110;
        txtLitersSelected.maxLength = 5;
    }

    row2S1.add(txtMileageSelected);
    section1.add(row2S1);

    //row3 construct
    var row3S1 = Ti.UI.createTableViewRow({
        color : "#000"
    });

    if (android) {
        section1.add(row3S1);
    }

    //section 2
    Ti.App.addEventListener('fuelChecked', function(data) {
        lblFuelSelected.text = data.fuel;
    });

    var lblFuelSelected = Ti.UI.createLabel({
        text : 'A80',
        right : 10,
        width : 150,
        color : '#666',
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT
        //backgroundColor : 'red'
    });

    if (Ti.App.Properties.getString('fuelTypeSelected')) {
        lblFuelSelected.text = Ti.App.Properties.getString('fuelTypeSelected');
    }

    var section2 = Ti.UI.createTableViewSection();

    var rowS2 = Ti.UI.createTableViewRow({
        title : L('rozrah_calc_fuel'),
        hasChild : true,
        color : "#000"
    });

    if (android) {
        rowS2.add(Ti.UI.createLabel({
            text : L('rozrah_calc_fuel'),
            color : '#000',
            left : 5
        }));
    }

    rowS2.add(lblFuelSelected);

    section2.add(rowS2);

    //section3
    var section3 = Ti.UI.createTableViewSection({
        headerTitle : L('rozrah_calc_type')
    });

    section3.add(Ti.UI.createTableViewRow({
        title : L('rozrah_calc_city'),
        leftImage : '/images/i4_common/city.png',
        color : "#000"
    }));
    section3.add(Ti.UI.createTableViewRow({
        title : L('rozrah_calc_highway'),
        leftImage : '/images/i4_common/highway.png',
        color : "#000"
    }));
    section3.add(Ti.UI.createTableViewRow({
        title : L('rozrah_calc_mix'),
        leftImage : '/images/i4_common/mix.png',
        color : "#000"
    }));

    var activeTypeIndex;

    Ti.API.info("move selected " + Ti.App.Properties.getString('MoveTypeSelected'))
    Ti.App.Properties.setString('MoveTypeSelected', '');
    Ti.API.info("NEW!!! move selected " + Ti.App.Properties.getString('MoveTypeSelected'))
    //XXX
    if (Ti.App.Properties.getString('MoveTypeSelected')) {
        Ti.API.info('NOT DEFAULT')
        for (var i = 0; i < section3.rows.length; i++) {
            if (i == Ti.App.Properties.getString('MoveTypeSelected')) {
                activeType = section3.rows[i];
                section3.rows[i].hasCheck = true;
                break;
            }
        }
    } else {
        Ti.API.info('DEFAULT')
        activeType = section3.rows[0];
        section3.rows[0].hasCheck = true;
        Ti.API.info("aType" + activeType)
        Ti.API.info("s3.row[0]" + section3.rows[0])
    }

    Ti.API.info("aType" + activeType)
    Ti.API.info("s3.row[0]" + section3.rows[0])

    var table = Ti.UI.createTableView({
        data : [section1, section2, section3],
        minRowHeight : 44
    });

    (!android) ? table.style = Ti.UI.iPhone.TableViewStyle.GROUPED : null;

    table.addEventListener('click', function(e) {

        switch(e.index) {
            case 0:
                //txtLitersSelected.focus();
                break;
            case 1:
                //txtMileageSelected.focus();
                break;
            case 2:
                if (android) {
                    break;
                }
                Ti.App.fireEvent('openGasWindow', {
                    fuelSelected : Ti.App.Properties.getString('fuelTypeSelected')
                });
                break;
            case 3:
                if (!android) {
                    break;
                }
                Ti.App.fireEvent('openGasWindow', {
                    fuelSelected : Ti.App.Properties.getString('fuelTypeSelected')
                });
                break;

        }

        var minIndex = 2, maxIndex = 5;
        if (android) {
            minIndex++;
            maxIndex++;
        }
        if (e.index > minIndex && e.index <= maxIndex) {
            Ti.API.info("e row " + e.row)
            Ti.API.info("e index " + e.index)
            Ti.API.info("e index -3 " + e.index - 3)
            e.row.hasCheck = true;
            activeType.hasCheck = false;
            activeTypeIndex = e.index - 3;
            activeType = e.row;
        }
    });

    var btnSave = Ti.UI.createButton({
        title : L('save')
    });
    if (!android) {
        btnSave.style = Ti.UI.iPhone.SystemButton.DONE;
    }

    btnSave.addEventListener('click', function(e) {
        Ti.API.info('SAVING')

        var mileageCount = 0;

        if (section1.footerTitle == '' && !android) {
            alert(L('rozrah_calc_wrong_data'))
            return;
        } else {
            if (android && section1.rows[2].title == '') {
                alert(L('rozrah_calc_wrong_data'))
                return;
            }
        }

        Ti.App.Properties.setString('MoveTypeSelected', activeTypeIndex);

        //FORM SAVE STRING
        var d = new Date();
        var realMonth = d.getMonth() + 1;
        var date = d.getDate() + '.' + realMonth + '.' + d.getFullYear();

        var consumption = {
            date : date,
            fuel : lblFuelSelected.text,
            type : activeType.title
        };

        if (android) {
            consumption.consumption = section1.rows[2].title.match(/\d.*/)[0];
        } else {
            consumption.consumption = section1.footerTitle.match(/\d.*/)[0];
        }

        //SAVE
        if (!Ti.App.Properties.getString('history')) {
            Ti.App.Properties.setString('history', '[' + JSON.stringify(consumption) + ']');
        } else {
            var tmp = Ti.App.Properties.getString('history');
            var tmp = eval(tmp);
            tmp.push(consumption);
            Ti.App.Properties.setString('history', JSON.stringify(tmp));
        }
        AIndicator.show({
            msg : true,
            title : L('saved'),
            autohide : true
        });

        Ti.App.fireEvent('refreshSpeedoBySavedData', {
            consumption : consumption.consumption
        });
        //self.close(); need to be closed by navigator

    });

    if (android) {
        var topView = Ti.UI.createView({
            top : 0,
            height : 44,
            width : Ti.UI.FILL,
            backgroundImage : '/images/i1_2/bottom_back.png'
        });
        btnSave.right = 5;
        //table.top = 44;

        topView.add(btnSave);
        self.add(topView);
    } else {
        self.rightNavButton = btnSave;
    }

    self.add(table);
    getConsumptions()

    function getConsumptions() {
        if (parseFloat(txtLitersSelected.value) > 0 && parseInt(txtMileageSelected.value)) {
            var result = parseFloat(txtLitersSelected.value) / parseInt(txtMileageSelected.value) * 100;

            for (var i = 0; i < 3; i++) {

                if ((result - Math.floor(result)).toFixed(1) != 0) {
                    if (android) {
                        section1.rows[2].title = L('rozrah_calc_consumption') + result.toFixed(1) + 'л/100км';
                    } else {
                        section1.footerTitle = L('rozrah_calc_consumption') + result.toFixed(1) + 'л/100км';
                    }
                    break;
                } else {
                    if (result.toFixed(i) != 0) {
                        if (android) {
                            section1.rows[2].title = L('rozrah_calc_consumption') + result.toFixed(i) + 'л/100км';
                        } else {
                            section1.footerTitle = L('rozrah_calc_consumption') + result.toFixed(i) + 'л/100км';
                        }
                        break;
                    }
                }
            }
        } else {

            if (android) {
                section1.rows[2].title = '';
            } else {
                section1.footerTitle = '';
            }
        }
        return;
    }

    return self;
}

module.exports = RozrahWindow;
