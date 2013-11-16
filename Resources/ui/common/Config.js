var Data = require('/models/Data');
var UI = require('/ui/common/UI');
var android = (Ti.Platform.osname == 'android') ? 1 : 0;

function Config(parent) {

    var self = Ti.UI.createWindow({
        backgroundImage: "/images/list_bg.png",
        layout : 'vertical'
    });
    if (!android) {
        self.navBarHidden = true;
    }

    var header = new UI.WindowHeader({
        has_back : 1,
        title : "Настройки и обновление",
        list_map : false
    });
    self.add(header);
    
    
    self.clickBack = function() {
        self.close();
    };

    header.addEventListener("back", self.clickBack);
    self.addEventListener("backButtonClicked", self.clickBack);
    var section1 = Ti.UI.createTableViewSection({
        headerTitle: "Информация"
    });

    var rowVersion = Ti.UI.createTableViewRow({
    });
    var rowLabel = Ti.UI.createLabel({
        color: "black",
        text : L('version'),
        left : 10
    });
    var rowVersionLabel = Ti.UI.createLabel({
        color: "black",
        text : '1.5.0',
        right : 10
    });
    rowVersion.add(rowLabel);
    rowVersion.add(rowVersionLabel);

    var rowLastUpdate = Ti.UI.createTableViewRow({
    });
    var rowLabel = Ti.UI.createLabel({
        color: "black",
        text : L('last_update'),
        left : 10
    });
    var date = new Date(), month = date.getMonth() - 0 + 1, result = date.getDate() + '.' + month + '.' + date.getFullYear();
    var rowDateLabel = Ti.UI.createLabel({
        color: "black",
        text : Ti.App.Properties.getString('lastUpdate', "27.01.2012"),
        right : 10
    });
    rowLastUpdate.add(rowLabel);
    rowLastUpdate.add(rowDateLabel);

    section1.add(rowVersion);
    section1.add(rowLastUpdate);

    var section2 = Ti.UI.createTableViewSection({
        headerTitle: "Обновление"
    });
    var btnUpdate = Ti.UI.createTableViewRow({
        title : L('check_updates'),
        color: "black",
        hasChild: true,
        onClick: function(e) {
           Data.checkUpdates(function(success, error) {
               if (success) {
                   Ti.App.Properties.setString('lastUpdate', String.formatDate(new Date()));
                   rowDateLabel.text = String.formatDate(new Date());
                   UI.AlertDialog(L('updated'));
               } else {
                   UI.AlertDialog(error);
               }
           });
        } 
        
    });
    var btnUpdateAll = Ti.UI.createTableViewRow({
        title : L('update_all'),
        color: "black",
        hasChild: true,
        onClick: function(e) {
           Data.updateAll(function(success, error) {
               if (success) {
                   Ti.App.Properties.setString('lastUpdate', String.formatDate(new Date()));
                   rowDateLabel.text = String.formatDate(new Date());
                   UI.AlertDialog(L('updated'));
               } else {
                   UI.AlertDialog(error);
               }
           });
        } 
    });
    //btnUpdateAll.addEventListener('click', );

    section2.add(btnUpdate);
    section2.add(btnUpdateAll);

    var table = Ti.UI.createTableView({
        data : [section1, section2],
        rowHeight : 44,
        minRowHeight : 44,
        maxRowHeight : 44,
        style : android ? null : Ti.UI.iPhone.TableViewStyle.GROUPED //!!android
    });

    table.addEventListener('click', function(e) {
        Ti.API.info(e);
        Ti.API.info(e.row.onClick);
        if (e.row.onClick) {
            e.row.onClick();
        }
        
    });

    self.add(table);

    return self;
}

module.exports = Config;
