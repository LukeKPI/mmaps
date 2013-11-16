'use strict';

aviasApp.controller('MainCtrl', function($scope) {



$scope.isUploaded = false;
//alert(JSON.stringify("sdfdsf"));
$scope.gridOptions = {
    watchDataItems : true,
    enablePaging : true,
    data : []
};

$scope.sendUploaded = function() {
    $scope.uploadInProgress = 1;
    for (var i = 0; i < $scope.uploaded_items.length; i++) {
        var loc = $scope.uploaded_items[i];
        $scope.uploaded_items[i].status_class = "label-default";
        $scope.uploaded_items[i].status = "Sent";
        createLocation(loc, (function(index) {
            return function(success, data, meta) {
                $scope.current++;
                if (success) {
                    console.log("siuccess", $scope.uploaded_items[index]);
                    $scope.uploaded_items[index].status_class = "label-success";

                    if (meta.method_name == "updatePlace") {
                        $scope.uploaded_items[index].status = "Updated";
                        $scope.updated++;
                    } else {
                        $scope.uploaded_items[index].status = "Added";
                        $scope.added++;
                    }
                } else {
                    console.log(data);
                    $scope.uploaded_items[index].status_class = "label-important";
                    $scope.uploaded_items[index].status = data;
                    $scope.errors.push(data)
                }

                $scope.$apply();
            }
        })(i));
    }
};

$scope.uploadFile = function(e) {
    //console.log(window.jQuery('#file'));
    $scope.error = '';
    window.jQuery('#upload_stations').upload('/avias/web/stations/upload', function(result) {
        alert(result);
        /*
         Address 1: "84 Piccadilly"
         Address 2: ""
         Category: "Eat and Drink"
         City: "London"
         Country: "UK"
         Organisation: "Starbucks"
         Phone No.: "0207 493 7752"
         Postcode: "W1J 8JB"
         Website: "http://starbucks.co.uk/"
         */

    }, 'html');
}
});
