'use strict';

aviasApp.controller('ServiceCtrl', function($scope, ServiceService) {
    var results = UserService.query({}, function(data) {
        $scope.list = data;
    }, function(err){
        alert(err)
    });

});
