/*
 * Tabbed Bar (TB) documentation
 *
 * This is a TB module (nodejs).
 *
 * OPTIONS : object
 *
 *   > top - value of top property
 *   > labelA(B) - label of first (second) btn
 *   > funcA(B) - function on tap event of btnA (btnB)
 *   > disableA(B) - make btn not tapable
 *
 * ADDITION
 *
 *   > object has function fireTapViewA(B) - they causes programing tap
 *      has parameters : object
 *      > makeActive - makes btn active without invoking
 *                     callback function (change color)
 *
 */

function TabbedBar(options) {
    options = options || {};
    var btnA = false;
    var btnB = true;

    var screenWidth = Ti.Platform.displayCaps.platformWidth;

    var tb = Ti.UI.createView({
        height : 44,
        width : Ti.UI.FILL,
        backgroundImage : '/images/i1_2/bottom_back.png'
    });
    if (options.top || options.bottom || options.top == 0 || options.bottom == 0) {
        tb.top = options.top;
        tb.bottom = options.bottom;
    } else {
        tb.bottom = 0;
    }

    var viewWrap = Ti.UI.createView({
        width : 140,
        height : 44
    });
    if (options.left || options.right || options.left == 0 || options.right == 0) {
        viewWrap.left = options.left;
        viewWrap.right = options.right;
    } else {
        viewWrap.left = screenWidth / 2 - 70;
    }

    var viewA = Ti.UI.createView({
        width : 70,
        height : 33,
        //backgroundColor : '#383860',
        left : 0, //screenWidth / 2 - 70,
        //borderRadius : 5,
        backgroundImage : '/images/TabbedBar/activeA.png'
    });
    viewA.add(Ti.UI.createLabel({
        text : options.labelA || L('list_dist'),
        font : {
            fontSize: "11dip",
            fontWeight : 'bold'
        },
        color : 'white'
    }));

    var funcA;
    if (options.funcA) {
        Ti.API.info('TabbedBar - user A');
        funcA = options.funcA;
    } else {
        funcA = function(e) {
            Ti.API.info('TabbedBar - def A');
        };
    }

    viewA.addEventListener('singletap', function(e) {
        if ((!btnA || options.disableA) && !e.makeActive)
            return;
        btnA = !btnA;
        btnB = !btnB;

        if (viewA.backgroundImage != '/images/TabbedBar/activeA.png') {
            viewA.backgroundImage = '/images/TabbedBar/activeA.png'
            viewB.backgroundImage = '/images/TabbedBar/unactiveB.png'
        };

        if (e.makeActive) {
            return;
        }
        funcA(tb, e);
        //Ti.API.info('A PRESSED must false - ' + btnA)
    });

    var viewB = Ti.UI.createView({
        width : 70,
        height : 33,
        //backgroundColor : '#3d5c89',
        left : 70, //screenWidth / 2,
        //borderRadius : 5,
        backgroundImage : '/images/TabbedBar/unactiveB.png'
    });
    viewB.add(Ti.UI.createLabel({
        text : options.labelB || L('list_regions'),
        font : {
            fontSize: "11dip",
            fontWeight : 'bold'
        },
        color : 'white'
    }));

    var funcB;
    if (options.funcB) {
        Ti.API.info('TabbedBar - user B')
        funcB = options.funcB;
    } else {
        funcB = function(e) {
            Ti.API.info('TabbedBar - def B');
        };
    }

    viewB.addEventListener('singletap', function(e) {
        //Ti.API.info('start');
        //Ti.API.info('btnB'+btnB)
        //Ti.API.info('options.disableB'+options.disableB);
        //Ti.API.info('acti'+e.makeActive)
        if ((!btnB || options.disableB) && !e.makeActive)
            return;
        //Ti.API.info('PASSED')
        btnA = !btnA;
        btnB = !btnB;

        if (viewB.backgroundImage != '/images/TabbedBar/activeB.png') {
            viewB.backgroundImage = '/images/TabbedBar/activeB.png'
            viewA.backgroundImage = '/images/TabbedBar/unactiveA.png'
        };
        if (e.makeActive) {
            Ti.API.info('makeActiveA')
            return;
        }
        //Ti.API.info('INVOKE funcB in TB ROUTE' + e.route)
        funcB(tb, e);
    });

    viewWrap.add(viewA);
    viewWrap.add(viewB);
    tb.add(viewWrap);

    tb.fireTapViewA = function(e) {
        viewA.fireEvent('singletap', e);
    }
    tb.fireTapViewB = function(e) {
        //Ti.API.info('fired TapB ROUTE'+e.route)
        viewB.fireEvent('singletap', e);
    }

    return tb;
}

module.exports = TabbedBar;
