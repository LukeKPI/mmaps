var Data = require('/models/Data');
var UI = require('/ui/common/UI');

function SingleOptWindow(data) {
    var android = (Ti.Platform.osname === 'android') ? 1 : 0;

    //create component instance
    var self = Ti.UI.createWindow({
        backgroundImage : "/images/list_bg.png",
    });

    var header = new UI.WindowHeader({
        has_back : 1,
        title : data.data.brand
    });
    self.add(header);
    header.addEventListener("back", function() {
        Ti.App.fireEvent("closeSingleOptWindow")
    });
    self.addEventListener("backButtonClicked", function() {
        Ti.App.fireEvent("closeSingleOptWindow")
    });

    //var SinglePassportDesign = require('/ui/common/SinglePassportDesign');
    var design = new singleWholesalerDesign({
        singleWholesaler : true,
        wholesalerId : data.id,
        data : data.data
    });
    design.top = UI.size.header;
    self.add(design);

    return self;
}

module.exports = SingleOptWindow;

var models = Data.models;
var fuels = {}, sFuels = [], currRegion, android = (Ti.Platform.osname == 'android') ? 1 : 0;
var currObject;

function singleWholesalerDesign(data) {
    var fuels = models.fuel.getList(), delta = Ti.Platform.displayCaps.platformWidth / 320;
    sFuels = fuels[0].slice(0);
    fuels = fuels[1];

    var mainWidth = 145;
    var leftWidth = UI.isTablet ? "5%" : 10;
    var rightWidth = UI.isTablet ? "45%" : 145;
    var fHeight = UI.isTablet ? "10%" : 50;
    var hHeight = UI.isTablet ? "10%" : 50;
    var top = UI.isTablet ? 6 : 6;
    //array of icons visibility 12 - real 11 with 0
    var icons = new Array(12);

    var view = Ti.UI.createView({
        backgroundImage : '/images/passport/back.png',
    });

    var container = Ti.UI.createView();

    view.add(container);
    view.container = container;

    var leftView = Ti.UI.createView({
        width : leftWidth,
        top : top,
        //backgroundColor : 'gray',
        left : 0,
    });
    //top
    leftView.add(Ti.UI.createView({
        width : 18,
        top : 0,
        height : hHeight,
        right : 0,
        backgroundImage : '/images/passport/left_header.png'
    }));
    //tangle
    leftView.add(Ti.UI.createView({
        width : 18,
        right : 0,
        top : hHeight,
        bottom : fHeight,
        backgroundImage : '/images/passport/left_tan.png'
    }));
    //bottom
    leftView.add(Ti.UI.createView({
        width : 18,
        height : fHeight,
        right : 0,
        bottom : 0,
        backgroundImage : '/images/passport/left_footer.png'
    }));
    //Ti.API.info('LEFT:'+leftWidth);
    //Ti.API.info('RIGHT:'+rightWidth);
    var mainView = Ti.UI.createView({
        top : top,
        left : leftWidth,
        right : rightWidth,
        //backgroundColor : 'green',
        //layout : 'vertical',
        //left : leftWidth
    });
    var rightView = Ti.UI.createView({
        width : rightWidth,
        right : 0,
        top : top,
    });
    //top
    rightView.add(Ti.UI.createView({
        width : 17,
        top : 0,
        height : hHeight,
        left : 0,
        backgroundImage : '/images/passport/right_header.png'
    }));
    //tangle
    rightView.add(Ti.UI.createView({
        width : 17,
        left : 0,
        top : hHeight,
        bottom : fHeight,
        backgroundImage : '/images/passport/right_tan.png'
    }));
    //bottom
    rightView.add(Ti.UI.createView({
        width : 17,
        height : fHeight,
        left : 0,
        bottom : 0,
        backgroundImage : '/images/passport/right_footer.png'
    }));
    //MAIN VIEW

    var headerView = Ti.UI.createView({
        top : 0,
        height : hHeight,
        backgroundImage : '/images/passport/header.png'
    });

    var fuelsView = Ti.UI.createView({
        layout : 'vertical',
        top : hHeight,
        bottom : fHeight,
    });
    var footerView = Ti.UI.createView({
        bottom : 0,
        height : fHeight,
        backgroundImage : '/images/passport/footer.png'
    });

    //------------DATA GATHERING
    var Data = require('/models/Data');

    currObject = data.data;

    if (!data.ukraineId)
        currRegion = models.region.findOneById(currObject.region_id);
    else
        currRegion = models.region.findOneById(data.ukraineId);

    if (sFuels.length > 7 && !UI.isTablet) {
        Ti.API.info('REZAT')
        for (var i = sFuels.length - 1; i >= 0; i--) {

            if (!currRegion[sFuels[i].code]) {

                sFuels.splice(i, 1);
                if (sFuels.length < 7)
                    break;
            }
        };
    }

    for (var i = 0, j = sFuels.length; i < j; i++) {
        var fuelView = Ti.UI.createView({
            height : (100 / sFuels.length).toFixed(1) + '%',
            //width : mainWidth,
            backgroundColor : 'white',
            backgroundImage : '/images/passport/row.png'
        });

        var fuelName = Ti.UI.createLabel({
            text : sFuels[i].name.replace("ENERGY", "Energy"),
            left : 10,
            left : 11,
            color : '#fff',
            font : {
                fontSize : UI.isTablet ? "22dip" : "12dip",
                fontWeight : 'bold'
            }
        });
        //PRICES ON FUEL FROM DIFF PLACES
        var fuelPrice = Ti.UI.createLabel({
            color : '#d99d00',
            right : 11,
            width : '30%',
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            verticalAlign : Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
            font : {
                fontSize : UI.isTablet ? "32dip" : "20dip",
                fontWeight : 'bold',
                fontFamily : 'ElectronicaC'
            },
            color : "yellow",
            top : "10%",
            bottom : 0

        });

        fuelPrice.text = (currObject[sFuels[i].code]) ? parseFloat(currObject[sFuels[i].code]).toFixed(2) : '-';
        fuelView.add(fuelName);
        fuelView.add(fuelPrice);

        fuelsView.add(fuelView);
    }

    //---------------COMPONENTS

    //COMMON RIGHT VIEW FOR PASPORTS
    var picHeight = 15;
    var brandHeight = 0;
    var addrHeight = 90;
    var phoneIcoHeight = 27;

    var rightHolder = Ti.UI.createView({
        height : Ti.UI.SIZE,
        layout : "vertical",
        left : UI.isTablet ? 22 : 16,
        right : 6,
        bottom : 6,
        //backgroundColor : 'red'
    });

    var headerBackView = Ti.UI.createView({
        height : 88 * delta,
        top : 0,
        backgroundImage : UI.isTablet ? '/images/i1_1/header_back@2x.png' : '/images/i1_1/header_back.png'
    });

    var fotoView = Ti.UI.createImageView({
        //width : '80%',
        left : UI.isTablet ? 22 : 22,
        right : 6,
        top : 3,
        image : UI.isTablet ? '/images/passport/foto@2x.png' : '/images/passport/foto.png',
        //right : 5
    });

    picHeight += 20;

    var brandLabel = Ti.UI.createLabel({
        text : currObject.brand,
        right : 5,
        left : UI.isTablet ? 11 : 6,
        bottom : 6,
        color : '#3a8dd7',
        font : {
            fontSize : UI.isTablet ? "28dip" : "14dip"
        },
    });

    rightView.add(fotoView);

    var addrLabel = Ti.UI.createLabel({
        text : currObject.addr,
        bottom : 6,
        left : UI.isTablet ? 11 : 6,
        right : 3,
        font : {
            fontSize : UI.isTablet ? "24dip" : "12dip"
        },
        color : '#585b5e'
    });
    var phoneIco = Ti.UI.createImageView({
        width : UI.isTablet ? 50 : 30,
        height : UI.isTablet ? 50 : 30,
        image : UI.isTablet ? '/images/passport/phone@2x.png' : '/images/passport/phone.png',
        bottom : UI.isTablet ? undefined : 6,
        top : UI.isTablet ? 0 : undefined,
        left : UI.isTablet ? 11 : 6
    });

    //PHONE
    var phone = currObject.phone ? currObject.phone.replace(/,|;/, "\n") : L('no phone');
    //Ti.API.info(phone);
    var phoneLabel = Ti.UI.createLabel({
        text : phone,
        bottom : 6,
        color : '#549ee0',
        left : UI.isTablet ? 72 : 6,
        right : 10,
        height : Ti.UI.SIZE,
        //wordWrap : false,
        font : {
            fontSize : UI.isTablet ? "27dip" : "13dip"
        },
    });

    phoneLabel.addEventListener('singletap', function(e) {
        var lbl = e.source;
        lbl.color = '#577fc1';
        UI.makePhoneCall(lbl.text);
        lbl.color = '#549ee0';
    });
    phoneIco.addEventListener('singletap', function(e) {
        var ico = e.source;
        ico.color = '#577fc1';
        UI.makePhoneCall(phoneLabel.text);
        ico.color = '#549ee0';
    });
    if (!currObject.phone) {
        phoneIco.hide();
        phoneLabel.hide();
    }

    //PHONE END

    var mapNav = new UI.MapNavigation("wholesaler");
    mapNav.addData(currObject);

    rightHolder.add(brandLabel)

    rightHolder.add(addrLabel)
    if (UI.isTablet) {
        var phoneView = Ti.UI.createView({
            height : Ti.UI.SIZE,
            bottom : 10,
            top : 10
        });

        phoneView.add(phoneIco);
        phoneView.add(phoneLabel);

        rightHolder.add(phoneView);
    } else {
        rightHolder.add(phoneIco)
        rightHolder.add(phoneLabel);
    }
    rightHolder.add(mapNav)
    rightView.add(rightHolder);

    //-------------CREATING

    mainView.add(headerView);
    mainView.add(fuelsView);
    mainView.add(footerView);

    container.add(leftView);
    container.add(mainView);
    container.add(rightView);

    return view;
}