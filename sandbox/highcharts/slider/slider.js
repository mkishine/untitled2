"use strict";
var app = angular.module('myApp', ['ui-rangeSlider']);
app.controller('DemoController',
    function DemoController($scope) {
        $scope.data = [];
        for(var ii = 0; ii < 100; ++ii) {
            $scope.data.push(Math.floor(Math.random()*100));
        }
        $scope.data.sort(function(a, b){return a-b});

        // just some values for the sliders
        $scope.demo1 = {
            min: 20,
            max: 80
        };

        $scope.execTimes = [
            {name: "low", y: 0, color: "hsl(0,0%,85%)"},
            {name: "medium", y: 0, color: "hsl(0,0%,50%)"},
            {name: "high", y: 0, color: "hsl(0,0%,35%)"}
        ];
        function countThem() {
            var et = $scope.execTimes;
            et.forEach(function(p){p.y=0});
            $scope.data.forEach(function(p){
                if ( p <= $scope.demo1.min )
                    ++et[0].y;
                else if ( p <= $scope.demo1.max )
                    ++et[1].y;
                else
                    ++et[2].y;
            });
        }
        countThem();
        $scope.$watch("demo1.min", function(newValue, oldValue) {
            countThem();
        });

        $scope.$watch("demo1.max", function(newValue, oldValue) {
            countThem();
        });
    })
    .directive('hcCoordinator', function () {
        return {
            restrict: 'C',
            transclude: true,
            controller: function ($scope) {
                $scope.pieCharts = {};
                this.registerPieChart = function (id, pieChart) {
                    $scope.pieCharts[id] = pieChart;
                };
            }
        };
    })
    .directive('hcPie', function () {
        return {
            require: '^hcCoordinator',
            restrict: 'EC',
            scope: {
                items: '='
            },
            controller: function ($scope, $element, $attrs) {
                $scope.setData = function (data) {
                    this.chart.series[0].setData(data, true);
                };
            },
            template: '<div id="container" style="margin: 0 auto">not working</div>',
            link: function (scope, element, attrs, coordinator) {
                scope.id = attrs["items"];
                element.attr("id", scope.id);
                var title = attrs["title"] || "";
                scope.chart = new Highcharts.Chart({
                    credits: {
                        enabled: false
                    },
                    chart: {
                        renderTo: element.attr("id"),
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: title,
                        style: {fontSize: "14px"},
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.1f}%</b>',
                        percentageDecimals: 1
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: false,
                            dataLabels: {
                                // prevent mismatch between slice color and connector color when
                                // slice color changes
                                connectorColor: '#000000',
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        data: scope.items,
                    }]
                });
                coordinator.registerPieChart(scope.id, scope);
                scope.$watch("items", function (data) {
                    scope.chart.series[0].setData(data, true);
                }, true);
            }
        }
    })
;
