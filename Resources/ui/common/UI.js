var osname = Ti.Platform.osname, version = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth;
//var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
var android = (Ti.Platform.osname == 'android') ? 1 : 0;
var isTablet = osname === 'ipad' || (osname === 'android' && (px2dip(width) >= 600 && px2dip(height) >= 600));
var uk = (Ti.Locale.currentLanguage === 'uk') ? 1 : 0;
var _ = require('/libs/underscore-min');
var sizes = {
    header : isTablet ? 66 : android ? 48 : 44,
    footer : isTablet ? 66 : android ? 48 : 44,
    filter : 36, 
};

function WindowHeader(props) {
    var self = Ti.UI.createView({
        //backgroundRepeat: true,
        top : 0,
        height : sizes.header
    });

    var bg = Ti.UI.createView({
        backgroundImage : isTablet ? "/images/header_tablet.png" : "/images/header.png",
        top : 0,
        left : 0,
        width : isTablet ? "100%" : 482,
        height : sizes.header
    });
    self.add(bg);
    if (props.has_back) {
        var back = Ti.UI.createButton({
            title : " " + L('back'),
            font : {
                fontSize : "11dip",
                fontWeight : "bold",
                fontFamily : "Arial"
            },
            color : "white",
            left : 6,
            width : 56,
            height : 44,
            backgroundImage : "/images/ui/back_button.png",
            backgroundSelectedImage : "/images/ui/back_button_tap.png",
        });
        back.addEventListener("click", function() {
            self.fireEvent("back");
        });
        self.add(back);
    }
    if (props.title) {
        var title = Ti.UI.createLabel({
            text : props.title,
            left : 67,
            right : 67,
            wordWrap : false,
            color : "white",
            font : {
                fontSize : "18dip",
                fontWeight : "bold"
            },
            shadowColor : "#093a6d",
            shadowOffset : {
                x : -1,
                y : -1
            },
            textAlign : "center",

        });
        self.add(title);

        self.setTitle = function(t) {
            title.text = t ? t : '';
        }
    }

    if (props.right_button) {
        var right = Ti.UI.createButton({
            backgroundImage : props.right_image ? props.right_image : '/images/ui/add.png',
            right : 0,
            width : 44,
            height : 44
        });
        self.add(right);

        right.addEventListener('singletap', function(e) {
            self.fireEvent('rightBtnTap', e)
        });
    }
    
    if (props.right_button_ok) {
       var bb = new ButtonBar({
            width : 101,
            height : 44,
            labels : [L('nearest_select_all'), L('nearest_select_none')],
            ifolder : "bb",
            flash: true,
            right : 6,
            index : -1
        });
        self.add(bb);
        bb.addEventListener("changeButtonMode", function(e) {
            if (e.index == 0) {
                self.fireEvent('select_all');
            } else {
                self.fireEvent('select_none');
            }
        });
        self.buttonBarIndex = function(index) {
            bb.activeButton(index);
        };
        self.selectBottomBar = function() {
            return bb
        };
        self.add(bb);
    }

    if (props.list_map) {
        var ml = new ButtonBar({
            right : 11
        });
        ml.right = 6;
        self.add(ml);
        ml.addEventListener("changeButtonMode", function(e) {
            self.fireEvent("changeMode", e);
        });
        self.listMapIndex = function(index) {
            ml.activeButton(index);
        }
    }
    return self;
}

function WindowFooter(props) {
    var self = Ti.UI.createView({
        //backgroundRepeat: true,
        bottom : 0,
        height : sizes.header
    });

    var bg = Ti.UI.createView({
        backgroundImage : "/images/footer.png",
        top : 0,
        left : 0,
        width : isTablet ? "100%" : 482,
        height : sizes.header
    });
    self.add(bg);

    if (props.button_bar) {
        var bb = new ButtonBar({
            width : 101,
            height : 44,
            labels : props.button_bar,
            ifolder : "bb"
        });
        self.add(bb);
        bb.addEventListener("changeButtonMode", function(e) {
            self.fireEvent("changeMode", e);
        });
        self.buttonBarIndex = function(index) {
            bb.activeButton(index);
        };
        self.selectBottomBar = function() {
            return bb
        };
    }

    if (props.left_button) {
        var left = Ti.UI.createButton({
            backgroundImage : props.left_image ? props.left_image : '/images/ui/trash.png',
            left : 0,
            height : 44,
            width : 44
        });
        self.add(left);

        left.addEventListener('singletap', function(e) {
            self.fireEvent('leftBtnTap', e)
        });
    }

    if (props.right_button) {
        var right = Ti.UI.createButton({
            backgroundImage : props.right_image ? props.right_image : '/images/ui/reload.png',
            right : 0,
            width : 44,
            height : 44
        });
        self.add(right);

        right.addEventListener('singletap', function(e) {
            self.fireEvent('rightBtnTap', e)
        });
    }

    return self;
}

function ButtonBar(props) {
    var iset = props.ifolder || 'bbi';
    var self = Ti.UI.createView({
        right : props.right || null,
        height : props.height || 88,
        width : props.width * 2 || 88,
    });
    var buttons = [];

    buttons[0] = Ti.UI.createButton({
        left : 0,
        font : {
            fontSize : "11dip",
            fontWeight : "bold",
            fontFamily : "Arial"
        },
        color : "white",
        height : props.height || 44,
        width : props.width || 44,
        title : props.labels ? props.labels[0] : null,
        index : 0,
    });
    buttons[1] = Ti.UI.createButton({
        font : {
            fontSize : "11dip",
            fontWeight : "bold",
            fontFamily : "Arial"
        },
        color : "white",
        right : 0,
        height : props.height || 44,
        width : props.width || 44,
        title : props.labels ? props.labels[1] : null,
        index : 1,
    });
    self.add(buttons[0]);
    self.add(buttons[1]);

    self.activeButton = function(index) {
        self.index = index;
        buttons.forEach(function(b, i) {
            if (i == self.index) {
                buttons[i].backgroundImage = '/images/ui/' + iset + '/' + i + "_tap.png";
                buttons[i].backgroundSelectedImage = '/images/ui/' + iset + '/' + i + "_tap.png";
            } else {
                buttons[i].backgroundImage = '/images/ui/' + iset + '/' + i + ".png";
                buttons[i].backgroundSelectedImage = '/images/ui/' + iset + '/' + i + ".png";
            }
        });
    };

    self.buttonClicked = function(e) {
        Ti.API.info('EEEEE ' + e.source.index + " " + self.index + " " + (e.source.index == self.index));
        if (e.source.index == self.index)
            return;
        self.activeButton(e.source.index);
        if (props.flash) {
            setTimeout(function() {
                self.activeButton(-1);
            }, 200);
        }
        self.fireEvent("changeButtonMode", {
            index : e.source.index
        });
    };
    buttons[0].addEventListener("click", self.buttonClicked);
    buttons[1].addEventListener("click", self.buttonClicked);

    self.activeButton(props.index || 0);
    return self;
}

function _replaceViewAndroid(container, view, keepView) {
    var children = container.children;
    for (var i = children.length - 1; i >= 0; i--) {
        if (keepView && children[i] == keepView)
            continue;
        var c = children[i];
        if (c != null && c != view) {
            if (c.isMapView) {
                container.remove(c);
            } else {
                c.hide();
            }
        }

    }
    if (children.indexOf(view) == -1) {
        container.add(view);
            
    } else {
        view.show();
    }
    
    if (keepView) {
        if (children.indexOf(keepView) == -1) {
            container.add(keepView);
        } else {
            keepView.show();
        }
    }
}

function _replaceView(container, view, keepView) {
    var children = container.children;
    for (var i = children.length - 1; i >= 0; i--) {
        if (keepView && children[i] == keepView)
            continue;
        var c = children[i];
        if (c != null) {
            container.remove(c);
        }

    }
    container.add(view);
    if (keepView)
        container.add(keepView);
}

function replaceView(container, view, disableAnim, keepView, back) {
    if (!android) {
        if (!disableAnim) {
            var anim = Ti.UI.createAnimation({
                view : view,
                transition : back ? Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT,
            });
            container.animate(anim);
            if (keepView) {
                container.add(keepView);
            }
        } else {
            _replaceView(container, view, keepView);
        }
    } else {
        _replaceViewAndroid(container, view, keepView);
    }

}

function showGeoAlert() {
    AlertDialog(L("error_disable_geo"));
}

function makePhoneCall(phone) {
    var code = '';
    if (phone.match(/(\(\d+?\))/)) {
        code = RegExp.$1;
        //phone = phone.replace(code, "");
    }
    phone = phone.replace(/\n/, ",");
    var list = phone.split(/[\n,;\|]/);
    for (var i = 0; i < list.length; i++) {
        var num = list[i];
        var pcode = code;
        if (num.match(/(\(\d+?\))/)) {
            pcode = RegExp.$1;
            num = num.replace(pcode, "");
        }
        list[i] = pcode + num;
    };
    list.push("Отмена");
    var dialog = Ti.UI.createOptionDialog({
        cancel : list.length - 1,
        options : list,
        title : L('phone')
    });

    dialog.addEventListener('click', function(e) {
        if (e.index === e.source.cancel) {
            return;
        }
        var telNumClean = list[e.index].replace(/[^0-9]/g, "");
        telNumClean = telNumClean.split(' ').join('');
        Ti.API.info('tel:'+telNumClean);
        Titanium.Platform.openURL('tel:'+telNumClean);
    });
    dialog.show();

}

function FilterSection() {
    var self = Ti.UI.createView({
        bottom : sizes.footer,
        height : 36,
        width : Ti.UI.FILL,
        backgroundImage : isTablet ? '/images/ra common/back_filter@2x.png' : '/images/ra common/back_filter.png',
    });

    var filterIco = Ti.UI.createView({
        left : 5,
        width : 11,
        height : 12,
        //backgroundColor : 'red'
        backgroundImage : '/images/ra common/filter.png'
    });

    var filterLabel = Ti.UI.createLabel({
        text : '',
        font : {
            fontSize : isTablet ? "14dip" : "11dip",
            fontWeight : 'bold'
        },
        color : 'white',
        left : 20,
        right: 36
    });

    var filterClose = Ti.UI.createView({
        //backgroundColor : 'black',
        backgroundImage : '/images/ra common/close.png',
        top : 0,
        right : 0,
        height : 36,
        width : 36
    });
    self.add(filterIco);
    self.add(filterLabel);
    self.add(filterClose);

    //after close - hide filter and show all stations
    filterClose.addEventListener('singletap', function(e) {
        self.fireEvent("closeFilter");
    });

    self.addText = function(txt) {
        filterLabel.text = txt;
    }
    return self;

}

function px2dip(ThePixels) {
    return android ? (ThePixels / (Titanium.Platform.displayCaps.dpi / 160)) : ThePixels;
};

function dip2px(TheDPUnits) {
    return android ? (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160)) : ThePixels;
};

function sortByDate(data) {
    _.each(data, function(rec, i) {
       //
    })

    data.sort(function(a, b) {
        a1 = a.date;
        b1 = b.date;
        return a1 < b1 ? 1 : a1 > b1 ? -1 : (a.odometr < b.odometr) ?1 :-1;
    });

    _.each(data, function(rec, i) {
        //rec.date = FormatDate(rec.date);
    })

    return data;
}

function convertDateStr(date) {
    dArr = date.split("-");
    var tmp = new Date();
    tmp.setFullYear(dArr[0]);
    tmp.setMonth(dArr[1] - 1)
    tmp.setDate(dArr[2])
    return tmp;
}

function FormatDate(d) {
    function addZero(v) {
        return (v < 10) ? '0' + v : v;
    }

    var tmp = d, month = tmp.getMonth() + 1;
    var date = tmp.getFullYear() + '-' + addZero(month) + '-' + addZero(tmp.getDate());
    return date;
}


function Stella(rightW) {
    var top = isTablet ? "5%" : -60;
    var leftWidth = isTablet ? "10%" : 31;
    var rightWidth = rightW ? rightW : isTablet ? "35%" : 128;
    var headerHeight = isTablet ? "20%" : 65;
    var footerHeight = isTablet ? "20%" : 118;

    var self = Ti.UI.createView({
        top : sizes.header,
        backgroundImage : '/images/passport/back.png'
    });

    var leftView = Ti.UI.createView({
        width : leftWidth,
        top : top,
        left : 0
    });
    //top
    leftView.add(Ti.UI.createView({
        top : 0,
        width : 19,
        height : headerHeight,
        right : 0,
        backgroundImage : '/images/i1_1/left_header.png'
    }));
    //tangle
    leftView.add(Ti.UI.createView({
        width : 19,
        right : 0,
        top : headerHeight,
        bottom : footerHeight,
        backgroundImage : '/images/i1_1/left_tan.png'
    }));
    //bottom
    leftView.add(Ti.UI.createView({
        width : 19,
        height : isTablet ? "20%" : 118,
        right : 0,
        bottom : 0,
        backgroundImage : '/images/i1_1/left_footer.png'
    }));

    var rightView = Ti.UI.createView({
        width : rightWidth,
        top : top,
        right : 0
    });
    //top
    rightView.add(Ti.UI.createView({
        width : 19,
        top : 0,
        height : headerHeight,
        left : 0,
        backgroundImage : '/images/i1_1/right_header.png'
    }));
    //tangle
    rightView.add(Ti.UI.createView({
        width : 19,
        top : headerHeight,
        left : 0,
        bottom : footerHeight,
        backgroundImage : '/images/i1_1/right_tan.png'
    }));
    //bottom
    rightView.add(Ti.UI.createView({
        width : 19,
        height : footerHeight,
        left : 0,
        bottom : 0,
        backgroundImage : '/images/i1_1/right_footer.png'
    }));
    //MAIN VIEW

    var mainView = Ti.UI.createView({
        top : top,
        left : leftWidth,
        right : rightWidth,
    });
    var headerView = Ti.UI.createView({
        top : 0,
        height : headerHeight,
        backgroundImage : '/images/i1_1/header.png'
    });
    mainView.add(headerView);

    var fuelsView = Ti.UI.createView({
        backgroundColor : "#4f4e4e",
        top : headerHeight,
        bottom : footerHeight,
    });
    mainView.add(fuelsView);

    var footerView = Ti.UI.createView({
        height : footerHeight,
        bottom : 0,
        backgroundImage : '/images/i1_1/footer.png'
    });
    mainView.add(footerView);

    //---------------COMPONENTS
    var delta = Ti.Platform.displayCaps.platformWidth / 320;
    var headerBackView = Ti.UI.createView({
        top:0,
        height: px2dip(88 * delta),
        backgroundImage : isTablet ? '/images/i1_1/header_back@2x.png' : '/images/i1_1/header_back.png'
    });

    var logoView = Ti.UI.createImageView({
        top : "10%",
        bottom : "10%",
        image : isTablet ? '/images/avias_logo.png' : '/images/ra common/avias_logo.png'
    });
    headerView.add(logoView);
    self.add(headerBackView);
    self.add(leftView);
    self.add(mainView);
    self.add(rightView);

    //------------DATA GATHERING
    self.addFuelsList = function(list) {
        if (fuelsView.children.length > 0) {
            fuelsView.remove(fuelsView.children[0]);
        }
        fuelsView.add(list);
    };

    self.addToRightView = function(view) {
        rightView.add(view);
    };

    self.addToFooterView = function(view) {
        footerView.add(view);
    };

    return self;
}

function Navigation(obj) {

    var self = Ti.UI.createView({
        bottom : 0,
        left:16,
        height : Ti.UI.SIZE,
        layout : 'vertical'
    });
    var currObject = obj;
    var btnWidth = 59;
    var btnHeight = 59;
    
    var fuelsWindow = null;

    //MENU

    var btnGas = Ti.UI.createButton({
        height : btnHeight,
        width : btnWidth,
        backgroundImage : isTablet ? '/images/i1_1/btn_filter@2x.png' : '/images/i1_1/btn_filter.png'
    });
    var btnList = Ti.UI.createButton({
        height : btnHeight,
        width : btnWidth,
        backgroundImage : isTablet ? '/images/i1_1/btn_list@2x.png' : '/images/i1_1/btn_list.png'
    });
    var btnMap = Ti.UI.createButton({
        height : btnHeight,
        width : btnWidth,
        backgroundImage : isTablet ? '/images/i1_1/btn_map@2x.png' : '/images/i1_1/btn_map.png'
    });

    var labelMap = Ti.UI.createLabel({
        text : L('nearest_mi_map'),
        font : {
            fontSize : "12dip",
            fontWeight : 'bold'
        },
        color : '#1d68b2',
        shadowColor: '#dddddd',
        shadowOffset: {x:0, y:-1},
        height: 'auto',
        bottom : 6
    });
    var labelList = Ti.UI.createLabel({
        text : L('nearest_mi_list'),
        font : {
            fontSize : "12dip",
            fontWeight : 'bold'
        },
        color : '#1d68b2',
        height: 'auto',
        bottom : 6
    });
    var labelGas = Ti.UI.createLabel({
        text : L('nearest_mi_gas'),
        font : {
            fontSize : "12dip",
            fontWeight : 'bold'
        },
        color : '#1d68b2',
        height: 'auto',
        bottom : 6,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });

    btnMap.addEventListener('singletap', function() {
        if (!currObject)
            return;
        Ti.App.fireEvent('openListWindow', {
            map : true,
            refresh : true,
            station : JSON.parse(JSON.stringify(currObject))
        });
    });
    btnList.addEventListener('singletap', function() {
        Ti.App.fireEvent('openListWindow');
    });
    btnGas.addEventListener('singletap', function() {
        if (fuelsWindow != null) {
            fuelsWindow.close;
            fuelsWindow = null;
        }
        var FuelsWindow = require('/ui/common/AZS/FuelsWindow');
        fuelsWindow = new FuelsWindow();

        fuelsWindow.open({
            modal:!android,
            modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
            modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
        });
    });

    self.add(btnMap);
    self.add(labelMap);
    self.add(btnList);
    self.add(labelList);
    self.add(btnGas);
    self.add(labelGas);
    
    self.addData = function(data) {
        currObject = data;
    };

    return self;

}

function StationFooterView() {
    //FOOTER
    var self = Ti.UI.createView({
        height : Ti.UI.SIZE,
        left: 11,
        right: 11,
        
    });

    var brandLabel = Ti.UI.createLabel({
        text : "", //'"' + currObject.brand + '"',
        font : {
            fontSize : isTablet ? "28dip" : "16dip",
            fontWeight : 'bold'
        },
        left : 0,
        textAlign: "center",
        verticalAlign: "top",
        right: 0,
        color : '#f5d258',
        top : 11
    });

    var labelAddr = Ti.UI.createLabel({
        text : "", //currObject.addr,
        font : {
            fontSize : isTablet ? "24dip" : "12dip"
        },
        left : 0,
        right: 0,
        verticalAlign: "top",
        textAlign: "center",
        color : '#fff',
        top : 44
    });

    self.add(brandLabel);
    self.add(labelAddr);

    self.addData = function(data) {
        brandLabel.text = data.brand;
        labelAddr.text = data.addr;
    };
    return self;
}

function FuelsView(data, models) {
    var fuels = models.fuel.getList();
    sFuels = fuels[0].slice(0);
    fuels = fuels[1];

    var self = Ti.UI.createView({
        top : 0,
        bottom : 0,
        layout : 'vertical',
    });

    if (sFuels.length > 7) {
        for (var i = sFuels.length - 1; i >= 0; i--) {
            if (!data[sFuels[i].code]) {

                sFuels.splice(i, 1);
                if (sFuels.length < 7)
                    break;
            }
        };
    }
    for (var i = 0; i < sFuels.length; i++) {
        var fuelView = Ti.UI.createView({
            height : 100 / sFuels.length + '%',
            backgroundColor : 'white',
            backgroundImage : '/images/i1_1/row.png',
        });

        var fuelName = Ti.UI.createLabel({
            text : sFuels[i].name.replace("ENERGY", "Energy"),
            left : 10,
            left : '5%',
            color : '#fff',
            textAlign : "left",
            font : {
                fontSize : isTablet ? "26dip" : "14dip",
                fontWeight : 'bold',

            },
            verticalAlign : Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
            top : 0,

            bottom : 0
        });
        //PRICES ON FUEL FROM DIFF PLACES
        var fuelPrice = Ti.UI.createLabel({
            color : 'yellow',
            right : '3%',
            //left : '55%',
            textAlign : "right",
            font : {
                fontSize : isTablet ? "44dip" : "24dip",
                fontWeight : 'bold',
                fontFamily : 'ElectronicaC'
            },
            verticalAlign : Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
            top : 0,

            bottom : 0
        });
        fuelPrice.text = (data[sFuels[i].code]) ? parseFloat(data[sFuels[i].code]).toFixed(2) : '-';
        fuelView.add(fuelName);
        fuelView.add(fuelPrice);
        self.add(fuelView);
    }
    return self;
}


function MapNavigation(m) {
    var mode = m;
    var currObject;
    var btnsHeight = isTablet && px2dip(Ti.Platform.displayCaps.platformWidth) > 620 ? 90 : 45;
    var btnsWidth = isTablet  && px2dip(Ti.Platform.displayCaps.platformWidth) > 620? 96 : 48;

    var self = Ti.UI.createView({
        //left: 0,
        layout : 'horizontal',
        top : 6,
        bottom : 0,
        width : Ti.UI.SIZE,
        horizontalWrap: false,
        height : btnsHeight
    });

    var btnMap = Ti.UI.createButton({
        width : btnsWidth,
        height : btnsHeight,
        backgroundImage : isTablet ? '/images/passport/map_tablet.png' : '/images/passport/map.png',
    });
    btnMap.addEventListener('singletap', function(e) {
        if (mode == "azs") {

            Ti.App.fireEvent('returnListWindow', {
                map : true,
                station : currObject
            });
            Ti.App.fireEvent('closeSingleAZSWindow');
        }

        if (mode == "seller") {
            Ti.App.fireEvent('returnKartListWindow', {
                map : true,
                seller : currObject
            });
            Ti.App.fireEvent('closeSingleKartWindow');
        }

        if (mode == "wholesaler") {
            Ti.App.fireEvent('returnOptListWindow', {
                map : true,
                wholesaler : currObject
            });
            Ti.App.fireEvent('closeSingleOptWindow');
        }
    });

    var btnRoute = Ti.UI.createButton({
        width : btnsWidth,
        height : btnsHeight,
        left : 6,
        backgroundImage : isTablet ? '/images/passport/route_tablet.png' : '/images/passport/route.png',
    });
    btnRoute.addEventListener('singletap', function(e) {
        var drawData;

        drawData = {
            latitude : currObject.lat,
            longitude : currObject.lon,
        };

        if (mode == "azs") {
            Ti.App.fireEvent('returnListWindow', {
                map : true,
                station : currObject,
                destination : drawData
            });
            Ti.App.fireEvent('closeSingleAZSWindow');
        }

        if (mode == "seller") {
            Ti.App.fireEvent('returnKartListWindow', {
                map : true,
                seller : currObject,
                destination : drawData
            });
            Ti.App.fireEvent('closeSingleKartWindow');
        }

        if (mode == "wholesaler") {
            Ti.App.fireEvent('returnOptListWindow', {
                map : true,
                wholesaler : currObject,
                destination : drawData
            });
            Ti.App.fireEvent('closeSingleOptWindow');
        }
    });

    self.add(btnMap);
    self.add(btnRoute);
    self.addData = function(data) {
        currObject = data;
    };

    return self;

}


function PhoneBlock() {
            //PHONE
        var self = Tu.UI.createView({
            width: Ti.UI.SIZE,
            height: Ti.UI.SIZE,
        });
        self.addData = function(data) {
            var phone = currObject.phone ? currObject.phone.replace(/,|;/,"\n") : L('no phone');
            phoneLabel.text = phone;
            if (!currObject.phone) {
                self.hide();
            } else {
                self.show();
            }
            //phoneIco.visible = !!currObject.phone;
        }
        var phoneLabel = Ti.UI.createLabel({
            text : "",
            top : '63%',
            color : '#549ee0',
            left : 23,
            right : 10,
            font : {
                fontSize : UI.isTablet ? "28dip" : "14dip"
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
        self.add(phoneIco);
        self.add(phoneLabel);
        //PHONE END
        return self;
}



function ConfirmDialog(text, title, callback, decline) {
    var dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : [L('confirm'), L('cancel')],
        message : text,
        title : title
    });
    dialog.addEventListener('click', function(e) {
        if (e.index === 0) {
            callback();
        } else {
            if (decline) decline();
        }
    });
    dialog.show();
}


function AlertDialog(text, title) {
    if (!title) title = L('attention');
    var dialog = Ti.UI.createAlertDialog({
        message : text,
        title : title
    });
    dialog.show();
}

module.exports = {
    WindowHeader : WindowHeader,
    WindowFooter : WindowFooter,
    ButtonBar : ButtonBar,
    replaceView : replaceView,
    isTablet : isTablet,
    isAndroid : android,
    isUk : uk,
    showGeoAlert : showGeoAlert,
    size : sizes,
    makePhoneCall : makePhoneCall,
    FilterSection : FilterSection,
    px2dip : px2dip,
    dip2px : dip2px,
    sortByDate : sortByDate,
    Stella: Stella,
    Navigation: Navigation,
    StationFooterView: StationFooterView,
    FuelsView: FuelsView,
    MapNavigation: MapNavigation,
    PhoneBlock : PhoneBlock,
    ConfirmDialog: ConfirmDialog,
    AlertDialog: AlertDialog,
}

