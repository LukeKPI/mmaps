'use strict';

aviasApp.controller('NavigationCtrl', function($scope, $location) {
  $scope.navClass = function(page) {
    var currentRoute = $location.path().substring(1) || 'home';
    currentRoute = currentRoute.split(/\//)[0];
    return page === currentRoute ? 'active' : '';
  };

});
