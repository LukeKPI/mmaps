var UI = require('/ui/common/UI');
function KartRegionsWindow(parent) {
	var SingleRegionsDesign = require('/ui/common/SingleRegionsDesign'),
        android = (Ti.Platform.osname === 'android') ? 1 : 0;

	//create component instance
	var self = Ti.UI.createView({
		bottom : UI.size.footer
	});

    new SingleRegionsDesign(self, parent, {
		Kart : true
	});

	return self;
}

module.exports = KartRegionsWindow;
