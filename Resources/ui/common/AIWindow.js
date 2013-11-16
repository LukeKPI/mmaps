var window;

var counter = 0, android = (Ti.Platform.osname == 'android') ? 1 : 0;
if (android) {
    var params = (params) ? params : {}, title = (params.title) ? params.title : L('loading');

    var androidAI = Ti.UI.Android.createProgressIndicator({
         message: title,
    });
}
var autoHideFunc = function(e) {
    setTimeout(function() {

        if (android) {
            setTimeout(function() {
                androidAI.hide();
            }, 500);

            return;
        }

        counter = 0;

        e.window.remove(e.msg);

        e.window.close({
            opacity : 0,
            duration : 500
        });
    }, 1000);
};

module.exports = {
    show : function(params) {
        if (android) {

            androidAI.show();
            counter++;

            if (params.autohide) {
                autoHideFunc();
            }

            return;
        }
        if (! window) {
            window = Ti.UI.createWindow({
            //    navBarHidden : true
            });
        }

        var middleView = Ti.UI.createView({
            backgroundColor : "black",
            opacity : 0.5,
            height : 88,
            width : 150,
            borderRadius : 5,
        });

        params = (!params) ? {} : params;

        params.ai = (params.msg) ? 0 : 1;
        params.title = (!params.title) ? L('loading') : params.title;
        counter++;
        var tm;

        if (counter > 1) {
            return;
        }

        if (params.ai) {
            var ai = Ti.UI.createActivityIndicator({
                message : params.title,
                color : '#fff'
            });
            middleView.add(ai);
            ai.show();
        } else {
            var msg = Ti.UI.createLabel({
                text : params.title,
                color : '#fff',
                textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
            });
            middleView.add(msg);
            

            if (params.autohide) {
                autoHideFunc({
                    window : window,
                    msg : msg
                });
            }

        }
        window.add(middleView);

        window.open();
    },
    hide : function() {
        counter--;

        if (android) {

            if (counter <= 0) {
                androidAI.hide();
                counter = 0;
            }

            return;
        }

        if (counter <= 0) {
            if (window.children.length)
                window.remove(window.children[0]);
            counter = 0;
            window.close();
        }
    }
}
