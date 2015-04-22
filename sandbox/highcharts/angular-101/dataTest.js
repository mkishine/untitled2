'use strict';
var ctrl = function ($scope, $http) {
    $scope.hello = "world";
    var promise = $http.get("data.json");
    promise.success(function (data) {
        $scope.hello = data;
        function counter(key, what) {
            var count = {};
            data.forEach(function (element) {
                var x = what ? element[what] : 1;
                if (count[element[key]] === undefined)
                    count[element[key]] = x;
                else
                    count[element[key]] += x;
            });
            return count;
        }

        function h2p(h) {
            var p = [];
            var max = undefined;
            for (var k in h) {
                p.push([k, h[k]]);
                if (max === undefined)
                    max = h[k];
                else
                    max = Math.max(max, h[k]);
            }
            p.sort(function (a, b) {
                var aa = a[1] == max ? a[1] : -a[1];
                var bb = b[1] == max ? b[1] : -b[1];
                return bb-aa;
            });
            return p;
        }

        $scope.userCounts = h2p(counter("user"));
        $scope.reportCounts = h2p(counter("report"));
        $scope.userTimes = h2p(counter("user", "req_time"));
        $scope.reportTimes = h2p(counter("report", "req_time"));
    });
}
var app = angular.module('dataTestApp', []);
app.controller("datatTestCtrl", ctrl);