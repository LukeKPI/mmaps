var Data = require('/models/Data');
var UI = require('/ui/common/UI');
var android = (Ti.Platform.osname == 'android') ? 1 : 0
function RunningLine(height) {
    var self = Ti.UI.createView({
        height : height,
    });
    var holder = Ti.UI.createView({
        height : height,
        width : 50000,
    });
    self.add(holder);
    var label = Ti.UI.createLabel({
        text : "",
        color : '#666',
        font : {
            fontSize: UI.isTablet ? "24dip" : "18dip",
            fontWeight : 'bold',
            fontFamily : 'ElectronicaC'
        },
        shadowColor:'#eee',
        shadowOffset: {x:0,y:1},
        height : height,
        width : Ti.UI.SIZE,
        wordWrap : false,
        top: "10%",
        left : 0,//Ti.Platform.displayCaps.platformWidth
    });
    holder.add(label);
    self.start = function() {
        var str = Data.getRegionStringList(-1); //ukraine
        if (str == label.text) {
            Ti.API.info('START ANIMATION - NO CHANGES');
            self.startAnimation();
        } else {
            Ti.API.info('START ANIMATION - APPLY NEW TEXT');
            label.addEventListener("postlayout", self.layoutCompleted);
            label.applyProperties({
                text:str
            });
        }
        
        
    };
    var animation = {};
    
    function step() {
        animation.left -= animation.step;
        if (animation.left < animation.target) {
            animation.left = -animation.step;
        }
        holder.left = animation.left; 
        animation.timer = setTimeout(step, 100);
    }
    self.startAnimation = function() {
        var sWidth = UI.px2dip(Ti.Platform.displayCaps.platformWidth);
        holder.left = 0;        
            
        if (!android) {
            var anim = Ti.UI.createAnimation({
                curve : Ti.UI.ANIMATION_CURVE_LINEAR,
            });
            anim.left = -label.rect.width/2;
            anim.duration = (label.rect.width /2 / sWidth) / 320* sWidth * 5000;
            Ti.API.info('DURAION ' + anim.duration);
            anim.repeat = 10000;
            holder.animate(anim);
        } else {
            if (animation.timer) {
                clearTimeout(animation.timer);
            }
            animation.target = -label.rect.width/2;
            animation.duration = (label.rect.width/2 / sWidth) / 320* sWidth * 5000;
            animation.time_step = 100;
            animation.left = 0;
            animation.step = label.rect.width/2 / (animation.duration / 100);
            Ti.API.info(JSON.stringify(animation));
            step();
        }
    };
    
    self.layoutCompleted = function(e) {
        if (e.source == label) {
            label.removeEventListener("postlayout", self.layoutCompleted);
            Ti.API.info(label.rect.width);
            self.startAnimation(); 
        } 
    };
    
    self.stop = function() {
        if (android) {
            if (animation.timer) {
                clearTimeout(animation.timer);
            }
        } else {

            holder.animate({left:0, duration:0});
        }
    };
    
    
    return self;
}


module.exports = RunningLine;