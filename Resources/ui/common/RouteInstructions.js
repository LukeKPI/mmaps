var android = (Ti.Platform.osname == 'android') ? 1 : 0, currRoute;


module.exports = function(params) {
    var self = Ti.UI.createView(params);

    var instructionsTable = Ti.UI.createTableView({
        maxRowHeight : 66,
        minRowHeight : 66,
        rowHeight : 66,
        backgroundColor : 'transparent',
        separatorColor : 'transparent'
    });

    instructionsTable.addEventListener('click', function(e) {
        self.fireEvent("routeSelected", {center: e.row.centerOnMap})
    });

    self.add(instructionsTable);

    self.addEventListener("fill", function(e) {
        var tData = [];
        for (var i = 0, j = e.instructions.length; i < j; i++) {

            var inst = e.instructions[i];

            var num = i + 1, text = inst.html, length = e.instructions[i].length;

            var row = Ti.UI.createTableViewRow({
                backgroundImage:"/images/list_item_small.png",
                hasChild : true,
                height: 66
            });
            var label = Ti.UI.createLabel({
                text : num + '. ' + text,
                font : {
                    fontSize: "12dip"
                },
                right: 66,
                left : 11
            });

            var labelLength = Ti.UI.createLabel({
                text : length,
                font : {
                    fontSize: "11dip"
                },
                width : 40,
                right : 10,
            });

            if (android) {
                label.color = "#666";
                labelLength.color = "#666";
            }

            row.add(label);
            row.add(labelLength);

            var middlePoint = getMiddlePoint(inst.startLocation.lat, inst.startLocation.lng, inst.endLocation.lat, inst.endLocation.lng);

            row.centerOnMap = middlePoint;

            tData.push(row);
        }

        if (!tData.length) {
            tData.push(Ti.UI.createTableViewRow({
                title : L('no_data')
            }));
        }

        instructionsTable.setData(tData);
    });

    return self;

}

function getMiddlePoint(x1, y1, x2, y2) {
    return {
        lat : (parseFloat(x2) + parseFloat(x1)) / 2,
        lng : (parseFloat(y2) + parseFloat(y1)) / 2,
        latDelta : Math.abs(x1 - x2).toFixed(4),
        lngDelta : Math.abs(y1 - y2).toFixed(4)
    };
};
