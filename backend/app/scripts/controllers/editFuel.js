'use strict';

aviasApp.controller('EditFuelCtrl', function($scope, $rootScope, FuelService) {

    $scope.formError = "";
    $scope.formErrorFields = {};
    $scope.fields = 'id,code,name,sort_order,color'.split(",");

    $scope.fieldState = function (name) {
        var err = $scope.formErrorFields[name];
        return  err ? "error" : "";
    }

    $scope.$on("editFuel", function(evt, item, index) {
            $scope.formError = "";
            $scope.formErrorFields = {};
            $scope.edited = angular.copy(item);
            console.log($scope.index);
            $scope.index = index;
            $('#modalEditFuelForm').modal("show");
    });

    
    $scope.saveChanges = function() {
        //clear errors
        $scope.formError = "";
        $scope.formErrorFields = {};

        //read fields
        var obj = {};
        for (var i=0; i < $scope.fields.length; i++) {
            obj[$scope.fields[i]] = $scope.edited[$scope.fields[i]];
        };
        //validate fields
        if (isNaN(obj.sort_order)) {
            $scope.formError = "Ошибка";
            $scope.formErrorFields = {sort_order:"Должно быть числом"};
            return;

        }
        if (obj.id) {
            //update
            FuelService.save(obj, function(data) {
                $rootScope.$broadcast("fuelEdited", data, $scope.index);
                $('#modalEditFuelForm').modal("hide");
            }, function(err) {
                //display errors
                $scope.formError = err.data.error;
                $scope.formErrorFields = err.data.fields;
            });
        } else {
            //insert
            FuelService.create(obj, function(data) {
                $rootScope.$broadcast("fuelAdded", data, $scope.index);
                $('#modalEditFuelForm').modal("hide");
            }, function(err) {
                $scope.formError = err.data.error;
                $scope.formErrorFields = err.data.fields;
            });
        }
    }
});