'use strict';

aviasApp.controller('FuelCtrl', function($scope, $rootScope, FuelService) {
    $scope.page = 1;
    $scope.total_pages = 1;
    $scope.page_size = 3;
    $scope.offset = ($scope.page - 1) * $scope.page_size;
    $scope.limit = $scope.page_size;

    $scope.error = "";

    $scope.loadList = function(page) {
        if (page < 1 || page > $scope.total_pages || page == $scope.page) {
            return;
        }
        $scope.page = page || 1;
        $scope.offset = ($scope.page - 1) * $scope.page_size;
        $scope.limit = $scope.page_size;

        FuelService.query({only_count: 1}, function(data) {
            console.log( Math.round(data[0].count / $scope.page_size )) ;
            $scope.total_pages = Math.round(data[0].count / $scope.page_size )
            //alert(data);
        }, function(err){
            $scope.error = err.data.error;
        });

        FuelService.query({offset:$scope.offset, limit:$scope.limit}, function(data) {
            $scope.items = data;
            console.log(data);
        }, function(err){
            $scope.error = err.data.error;
        });
    }


    $scope.editRecord = function(index){
        $rootScope.$broadcast("editFuel", $scope.items[index], index);
    }

    $scope.addRecord = function(){
        $rootScope.$broadcast("editFuel", {}, 0);
    }

    $scope.deleteRecord = function(index){
        $scope.deleteError = "";
        $scope.deletingIndex = index;
        $scope.deletingItem = $scope.items[index];
        $scope.deletingID = $scope.items[index].id;
        $('#modalDeleteConfirmForm').modal("show");
    }

    $scope.deleteConfirmed = function(index){
        FuelService.destroy({id: $scope.deletingID}, function(data) {
            $scope.loadList();
            $('#modalDeleteConfirmForm').modal("hide");
        }, function(err){
            $scope.deleteError = err.data.error;
        });

    }

    $scope.$on("fuelEdited", function(evt, item, index) {
        $scope.items[index] = item;
    });
    $scope.$on("fuelAdded", function(evt, item) {
        $scope.loadList();
    });

    $scope.loadList();
});
