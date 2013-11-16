module.exports = {
    getPoints : function(coords, callback) {
        var self = this;
        //var indexOfNextInstruction = [];
        var url = 'http://maps.googleapis.com/maps/api/directions/json?origin=' + coords[0].lat + ',' + coords[0].lon + '&destination=' + coords[1].lat + ',' + coords[1].lon + '&sensor=false&language=ru'

        var xhr = Ti.Network.createHTTPClient({
            onload : function(e) {
                var mapObj = JSON.parse(this.responseText);

                if (!!mapObj.routes.length == false) {
                    Ti.App.fireEvent('routeReady', {
                        error : L('can_not_get_route')
                    });
                }
                var points = [], instructions = [], steps = mapObj.routes[0].legs[0].steps;
                //Ti.API.info('Data from Google received')

                for (x in steps) {
                    if (steps.length > 1) {

                        if ('polyline' in steps[x] && 'points' in steps[x].polyline) {
                            var arr = self.decodePoly(steps[x].polyline.points);

                            //indexOfNextInstruction.push(points.length);

                            points = points.concat(arr);

                            instructions.push({
                                html : steps[x].html_instructions.replace(/<div.*?>/g, '. ').replace(/<.*?>/g, ''),
                                length : steps[x].distance.text,
                                startLocation : steps[x].start_location,
                                endLocation : steps[x].end_location
                            });
                        }

                    }
                }

                //Ti.API.info(points)
                //Ti.API.info(instructions)
                callback({
                    points : points,
                    instructions : instructions,
                    //indexOfNextInstruction : indexOfNextInstruction
                });
                //Ti.App.fireEvent('routeReady', {
                //    points : points,
                //    instructions : instructions,
                    //indexOfNextInstruction : indexOfNextInstruction
                //});
            },
            onerror : function(e) {
                alert(L('connection_problem'));
            },
            timeout : 5000
        });

        xhr.open('GET', url);
        xhr.send();

    },
    decodePoly : function(encoded) {
        var poly = [];
        var index = 0, len = encoded.length;
        var lat = 0, lng = 0;

        //Ti.API.info('decodePoly starts')

        while (index < len) {

            var b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            poly.push({
                latitude : lat / 1e5,
                longitude : lng / 1e5
            });
        }

        return poly;
    }
}
