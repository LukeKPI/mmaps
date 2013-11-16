'use strict';

describe('Controller: FuelCtrl', function() {

  // load the controller's module
  beforeEach(module('aviasApp'));

  var FuelCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    FuelCtrl = $controller('FuelCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
