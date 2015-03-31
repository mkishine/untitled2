'use strict';
angular.module("ng_app",[])
    .controller("ctrl1",function($scope) {
        $scope.data = { hello : "world"};
    })
    .controller("ctrl2",function($scope) {
        $scope.data = { world : "hello"};
    })
;
