'use strict';

var aviasApp = angular.module('aviasApp', ['ngResource'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/service', {
        templateUrl: 'views/service.html',
        controller: 'ServiceCtrl'
      })
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/fuel', {
        templateUrl: 'views/fuel.html',
        controller: 'FuelCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);

aviasApp.factory('UserService', function($resource) {
    return $resource('http://localhost/avias/web/users/:id',{
        id : '@id'
    },{
        query : { method : 'GET', isArray : true },
        get : { method : 'GET'},
        save : { method : 'PUT' },
        create : { method : 'POST' },
        destroy : { method : 'DELETE' }
    });
});

aviasApp.factory('FuelService', function($resource) {
    return $resource('http://localhost/avias/web/fuels/:id',{
        id : '@id'
    },{
        query : { method : 'GET', isArray : true },
        get : { method : 'GET'},
        save : { method : 'PUT' },
        create : { method : 'POST' },
        destroy : { method : 'DELETE' }
    });
});


aviasApp.factory('ServiceService', function($resource) {
    return $resource('http://localhost/avias/web/services/:id',{
        id : '@id'
    },{
        query : { method : 'GET', isArray : true },
        get : { method : 'GET'},
        save : { method : 'PUT' },
        create : { method : 'POST' },
        destroy : { method : 'DELETE' }
    });
});
