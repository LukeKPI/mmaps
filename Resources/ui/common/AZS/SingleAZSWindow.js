var Data = require('/models/Data');
var UI = require('/ui/common/UI');

var rowTemplate = {
	properties : {
		height : UI.isTablet ? 88 : 66,
		allowsSelection : false,
	},
	childTemplates : [{
		type : "Ti.UI.View",
		bindId : 'bg',
		properties : {
			backgroundImage : '/images/list_item_bg.png',
		},
		childTemplates : [{
			type : "Ti.UI.Label",
			bindId : "brand",
			properties : {
				font : {
					fontSize : UI.isTablet ? "20dp" : "14dip",
					fontWeight : 'bold',
				},
				shadowColor : "#e8e8e9",
				shadowOffset : {
					x : 0,
					y : 1
				},
				top : "5%",
				left : 22,
				wordWrap : false,
				color : '#0a4882',
				className : "title",
				touchEnabled : false
			}
		}, {
			type : "Ti.UI.Label",
			bindId : "addr",
			properties : {
				bottom : 0,
				left : 22,
				wordWrap : true,
				height : UI.isTablet ? "68dp" : "44dip",
				color : '#666666',
				font : {
					fontSize : UI.isTablet ? "15dp" : "11dip",
				},
				className : "subtitle",
				touchEnabled : false
			}
		}]
	}]
};

function makeDataList(data) {
	if (data) {
		var items = [];
		var sections = [];
		items.push({
			addr : {
				text : data['addr']
			},
			brand : {
				text : 'Адреса'
			}
		});
		items.push({
			addr : {
				text : data['lat']
			},
			brand : {
				text : 'Широта'
			}
		});
		items.push({
			addr : {
				text : data['lon']
			},
			brand : {
				text : 'Довгота'
			}
		});
		items.push({
			addr : {
				text : "Астрономічна довгота на земній поверхні дорівнює різниці місцевого часу (середнього сонячному або зоряного) в обумовленому пункті й часі початкового (грінвічського) меридіана (всесвітній час) з астрономічних спостережень і залежить від напрямку прямовисної лінії (нормалі до геоїда) в обумовленому пункті. Тобто двогранний кут між площиною початкового астрономічного меридіана і площиною астрономічного меридіана даної точки земної поверхні. У міжнародній практиці така довгота вважається додатною на захід, а в колишньому СРСР переважно на схід від 0° до 360° (у годинному вимірі від 0 до 24). Позначається буквою λ. Астрономічною довготою називається також одна з координат в екліптичній системі небесних координат."
			},
			brand : {
				text : 'Довгий текст'
			}
		});
		
		for (var i = 0; i < 10; i++) {
		items.push({ addr: { text: 'Значення '+i }, brand: { text: 'Тестові дані' }});
		}

		//new_section.setItems(items);
		var new_section = Ti.UI.createListSection({
			items : items
		});
		//makeTableData(data, rowHolder, container, params.areaId || params.regionId ? 999999 : 0, self.clickRow);
	}

	return [new_section] || [];
};

function SingleAZSWindow(e) {
	var data = e.data;
	var android = (Ti.Platform.osname === 'android') ? 1 : 0;

	//create component instance
	var self = Ti.UI.createWindow({
		// navBarHidden : true,
		backgroundColor : 'transparent',
	});

	var header = new UI.WindowHeader({
		has_back : 1,
		title : data.brand
	});
	self.add(header);
	header.addEventListener("back", function() {
		Ti.App.fireEvent("closeSingleAZSWindow")
	});
	self.addEventListener("backButtonClicked", function() {
		Ti.App.fireEvent("closeSingleAZSWindow")
	});

	var footer = new UI.WindowFooter({});	

	var mapNav = new UI.MapNavigation("azs");
	mapNav.addData(data);
	mapNav.bottom = 6;

	/*var table = Ti.UI.createTableView({
	 top: UI.size.header,
	 bottom: UI.size.footer,
	 backgroundColor : 'transparent',
	 separatorColor : 'transparent',
	 });*/
	var section = Ti.UI.createListSection();
	var table = Ti.UI.createListView({
		sections : [section],
		templates : {
			'template' : rowTemplate
		},
		defaultItemTemplate : 'template',
		backgroundColor : 'white',
		rowHeight : 66,
		top : UI.size.header,
		bottom : UI.size.footer,
		showVerticalScrollIndicator : true,
	});
		
	Ti.API.timestamp();
	var resultStation = Data.models.station.findOneById(data.id);
	Ti.API.timestamp();
	table.setSections(makeDataList(resultStation));
	Ti.API.timestamp();

	self.add(header);
	self.add(footer);
	self.add(table);

	self.add(mapNav);

	return self;
}

module.exports = SingleAZSWindow; 