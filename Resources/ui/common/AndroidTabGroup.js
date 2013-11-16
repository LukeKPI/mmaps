var osname = Ti.Platform.osname, version = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth;
var dpi = Titanium.Platform.displayCaps.dpi;
var dip2px = function(TheDPUnits) {
	return (TheDPUnits * (dpi / 160));
};
var openedWindows = [];
function AndroidTabGroup(props) {
    
	
	var self = Ti.UI.createWindow({
		navBarHidden : true,
		exitOnClose : true,
		backgroundColor: "#1b4365",
	});
	self.index = 0;
	var tabs = [];

	var tabHolder = Ti.UI.createScrollView({
		top : 0,
		backgroundColor : "transparent",
		contentWidth : 'auto',
		layout : "horizontal",
		scrollType : 'horizontal',
		horizontalWrap : false,
		height : 54,
	});
	var bottomLine = Ti.UI.createView({
		top : 54,
		height : 2,
		backgroundColor : "#f7be10",
	});

	self.add(bottomLine);
	self.add(tabHolder);

	self.addTab = function(tab, id, title) {
		//add separator
		var borderLeft = Ti.UI.createView({
			bottom : 14,
			top : 14,
			width : 1,
			backgroundColor : "#2e85b0",
		});
		if (tabs.length != 0) {
			tabHolder.add(borderLeft);
		}
		tabs.push(tab);
		tab.index = tabs.length - 1;
		tab.id = id;
		tab.title = title;
		tabHolder.add(tab);
		tab.addEventListener("tabSelected", function(e) {
			self.setActiveTab(e.index);
		});

	};
	self.addEventListener("close", function() {
		if (self.activeTab) {
			self.activeTab.window.close();
		}
	});
	self.activeTabIndex = -1;
	self.setActiveTab = function(index, headerBGImage, headerIcon) {
		//closePrevious tab
		if (self.activeTabIndex == index) return;
		var ptab = null;
		var pIndex = -1;
		if (self.activeTabIndex != -1 && self.activeTabIndex != index) {
		    pIndex = self.activeTabIndex;
			ptab = tabs[self.activeTabIndex];
			ptab.setInactive();
		}
		var tab = tabs[index];
		self.activeTab = tab;
		self.activeTabIndex = index;
		self.index = self.activeTabIndex;

		tab.setActive();
		if (tab.window) {
			tab.window.fireEvent('show');
			tab.window.zIndex = 100;
			tab.window.show();			
		} else {
		    tab.window = new tab.windowClass();
			tab.window.navGroup = tab;
			tab.window.top = index == 0 ? 0 : 56;
			tab.window.zIndex = 100;
			tab.window.open();
			tab.window.alreadyOpened = true;
		};
		if (ptab) {
		    //ptab.window.hide();
			for (var i = openedWindows.length - 1; i >= 0; i--) {
			    if (!openedWindows[i]) continue;
				//Style.cleanup(openedWindows[i]);
                openedWindows[i].close();
				openedWindows[i] = null;
			};
			openedWindows = [];
            if (pIndex == 0) {
                ptab.window.hide();
            } else {
                Ti.API.info('WINDOW CLOSINF...');
                ptab.window.hide();
                ptab.window.fireEvent("hideTab");
                ptab.window.zIndex = 1;
                //ptab.window = null;
                Ti.API.info('WINDOW CLOSED AND NULLED');
            }
		}
		tab.window.zIndex = 1;
		tab.fireEvent("focus");
		if (headerBGImage) {
			headerHolder.backgroundImage = headerBGImage;
			headerHolder.add(headerIcon);
		}
		Ti.App.Properties.setInt("selectedTab", index);
	};
	self.addEventListener('android:back', function(e) {
		if (openedWindows.length) {
			//openedWindows[openedWindows.length - 1].close();
			openedWindows[openedWindows.length - 1].fireEvent("backButtonClicked");
		} else {
		    if (self.activeTabIndex != 0) {
		        self.activeTab.window.fireEvent("backButtonClicked")
		        //self.setActiveTab(0);
		    } else {
		        var UI = require('ui/common/UI');
		        UI.ConfirmDialog(L('close_confirm'),L('confirm'), function(){
		            self.close()
		        });
		    }
		}
	});
    self.addEventListener("close", function() {
        setTimeout(function() {
        Ti.Android.currentActivity.finish();
        } , 1000);
    });

	return self;
}

function AndroidTab(props) {
	var self = Ti.UI.createView({
		width : 90,
		backgroundColor : "transparent",
	});
    self.windowClass = props.windowClass; 

	self.saved_title = props.title;
	self.window = props.window;
	props.window = null;
	var title = Ti.UI.createLabel({
		bottom : 12,
		top : 12,
		textAlign : "center",
		font : {
			fontWeight : "bold",
			fontSize : "13dp"
		},
		text : props.title.toUpperCase(),
		color : "#3da4d2",
		width : "auto",
	});
	self.add(title);
	var bottomLine = Ti.UI.createView({
		bottom : 0,
		height : 8,
		backgroundColor : 'transparent'
	});
	self.add(bottomLine);
	self.setActive = function() {
		bottomLine.backgroundColor = "#f7be10";
		title.color = "white";
	};
	self.setInactive = function() {
		bottomLine.backgroundColor = "transparent";
		title.color = "#3da4d2";
	};
	var tapView = Ti.UI.createView({
		backgroundColor : "silver",
		opacity : 0.3,
		visible : false
	})
	self.add(tapView);

	self.addEventListener('touchstart', function() {
		tapView.visible = true;
	})
	self.addEventListener('touchend', function() {
		tapView.visible = false;
	})
	self.addEventListener('touchcancel', function() {
		tapView.visible = false;
	})

	self.addEventListener("click", function() {
		self.fireEvent("tabSelected", {
			index : self.index,
			headerBGImage : props.headerBGImage,
			headerIcon : props.headerIcon
		});
	});
    function closeHandler(e) {
            var i = openedWindows.indexOf(e.source);
            if (i>-1) {
              openedWindows[i] = null;
              openedWindows.splice(i, 1);    
            }
    };
	self.open = function(w) {
		w.top = 56;
		openedWindows.push(w);
		w.addEventListener("close", closeHandler);
		w.zIndex = openedWindows.length +10;
		w.open();
		w = null;
	}

	return self;
}

module.exports = {
	TabGroup : AndroidTabGroup,
	Tab : AndroidTab
}
