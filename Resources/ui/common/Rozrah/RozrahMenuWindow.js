var android = (Ti.Platform.osname == 'android') ?1 :0;

function singleRozrahBlock(offsetFrame, left, top, right, size, title, hint, Z, type) {
    var delta = Ti.Platform.displayCaps.platformWidth / 320;
    
    if (offsetFrame) offsetFrame *= delta;
    if (left) left *= delta;
    if (top) top *= delta;
    if (right) right *= delta;
    if (size) size *= delta;
    
    if (!size) size = 115 * delta; 
    if (!Z) Z = 0; 

    var self = Ti.UI.createView({
        height : 200*delta,
        width : 200*delta,
        left : left,
        top : top,
        right : right,
        //backgroundColor : 'red',
        zIndex : Z
    });

    var speedo = Ti.UI.createView({
        height : size,
        width : size,
        backgroundImage : '/images/i4_0/speedo.png'
    });

    var frame = Ti.UI.createView({
        height : 42*delta,
        width : 101*delta,
        backgroundImage : '/images/i4_0/frame.png',
        bottom : 35*delta,
        left : offsetFrame,
    });

    var text = Ti.UI.createLabel({
        text : title || "Text",
        color : 'white',
        font : {
            fontSize : 13*delta
        },
        height : 15*delta
    });

    var hint = Ti.UI.createLabel({
        text : hint || "Hint",
        bottom : 25 * delta,
        color : 'white',
        font : {
            fontSize : 12*delta
        }
    });

    if (type) {
        var path = '/images/i4_0/city.png';
        var top = 65*delta;

        if (type == 2) {
            path = '/images/i4_0/highway.png';
            frame.bottom = 30*delta;
            hint.bottom = 20*delta;
            top = 75*delta;
        };
        if (type == 3) {
            path = '/images/i4_0/mix.png';
        };

        var ico = Ti.UI.createImageView({
            image : path,
            top : top
        });
        speedo.add(ico);
    } else {
        var list = Ti.App.Properties.getString('history');
        list = eval(list);
        if (list) {
            text.text = list[list.length - 1].consumption;
        } else {
            text.text = '10л/100км'
        }
    }

    self.add(speedo);
    frame.add(text);
    self.add(frame);
    self.add(hint);

    return self;
}

function RozrahMenuWindow() {
    //create component instance
    var self = Ti.UI.createWindow({
        navBarHidden : false,
        backgroundColor : '#000',
        title : L('rozrah_menu_title'),
        barColor : '#0c4e8d',
        backButtonTitle : L('back')
    });
    if (android) {
        self.navBarHidden = true;
    }

    var backView = Ti.UI.createView({
        backgroundImage : '/images/i4_0/back.png',
        bottom : 0
    });

    var btnHistory = Ti.UI.createButton({
        title : L('rozrah_menu_history'),
        bottom : 11 + 46 + 11,
        backgroundImage : '/images/i4_0/btn.png',
        width : 278,
        height : 46,
        color : "#fff"
    });

    btnHistory.addEventListener('singletap', function() {
        Ti.App.fireEvent('openHistoryWindow');
    });

    var btnRozrah = Ti.UI.createButton({
        title : L('rozrah_menu_calc'),
        bottom : 11,
        backgroundImage : '/images/i4_0/btn.png',
        width : 278,
        height : 46,
        color : "#fff"
    });

    btnRozrah.addEventListener('singletap', function() {
        Ti.App.fireEvent('openRozrahWindow');
    });

    // params - 			offsetFrame, left, top, right, size, title, hint, z-index, type
    var speedo1 = singleRozrahBlock(55, -50, 1, null, 115, "07л/100км", L('rozrah_menu_city'), 1, 1);
    var speedo2 = singleRozrahBlock(null, null, -30, null, 130, "10л/100км", L('rozrah_menu_highway'), null, 2);
    var speedo3 = singleRozrahBlock(45, null, 1, -50, 115, "08л/100км", L('rozrah_menu_mix'), 1, 3);
    var speedo4 = singleRozrahBlock(null, null, 120, null, 115, null, L('rozrah_menu_last'));

    Ti.App.addEventListener('refreshSpeedoBySavedData', function(e) {
        //Ti.API.info(e.consumption)
        speedo4.children[1].children[0].text = e.consumption;
        //Ti.API.info(speedo4.children[1].children[0]);
    });

    self.add(backView);

    self.add(speedo1);
    self.add(speedo2);
    self.add(speedo3);
    self.add(speedo4);

    self.add(btnHistory);
    self.add(btnRozrah);

    return self;
}

module.exports = RozrahMenuWindow;
