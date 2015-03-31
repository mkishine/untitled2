'use strict';
angular.module("sportsStore")
	.constant("dataUrl","http://localhost:5500/products")
	.controller("sportsStoreCtrl",function($scope, $http, dataUrl) {
			// console.log("Hello");
			$scope.data = {};
			$http.get(dataUrl)
			.success(function(data) {
				// console.log("Data");;
				$scope.data.products = data;
			})
			.error(function(data, status) {
				// console.log("Error");
				// debugger;
				$scope.data.error = { "status" : status };
				// debugger;
			});
		});
