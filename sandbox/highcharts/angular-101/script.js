angular.module('myApp', [])
    .controller("MyCtrl", function ($scope, $http) {
        var promise = $http.get("data.json");
        promise.success(function (data) {
            $scope.data = data;
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
    })
    .directive('hcPie', function () {
        return {
            restrict: 'E',
            // see discussion of replace option at
            // http://stackoverflow.com/questions/22497706/angular-directive-replace-true
            // Also, replace option is depreciated
            // see: http://stackoverflow.com/questions/24194972/why-is-replace-deprecated-in-angularjs
            // replace: true,


            // scope option is used to isolate scope
            // see docsIsolateScopeDirective example at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            scope: {
                items: '='
            },
            // controller option allows us create directives that communicate
            // see docsTabsExample at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            controller: function ($scope, $element, $attrs) {
                console.log("processing controller option");
            },
            template: '<div id="container" style="margin: 0 auto">not working</div>',
            // use link option to manipulate DOM
            // see docsTimeDirective example at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            link: function (scope, element, attrs) {
                console.log("processing link option");
                element.attr("id", attrs["items"]);
                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element.attr("id"),
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: 'Browser market shares at a specific website, 2010'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage}%</b>',
                        percentageDecimals: 1
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                color: '#000000',
                                connectorColor: '#000000',
                                formatter: function () {
                                    return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Browser share',
                        data: scope.items
                    }]
                });
                scope.$watch("items", function (newValue) {
                    chart.series[0].setData(newValue, true);
                }, true);

            }
        }
    })
    .directive('hcScatter', function () {
        return {
            restrict: 'E',
            // scope option is used to isolate scope
            // see docsIsolateScopeDirective example at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            scope: {
                items: '='
            },
            // controller option allows us create directives that communicate
            // see docsTabsExample at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            controller: function ($scope, $element, $attrs) {
                console.log("processing controller option");
            },
            template: '<div id="container" style="margin: 0 auto">not working</div>',
            // use link option to manipulate DOM
            // see docsTimeDirective example at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            link: function (scope, element, attrs) {
                console.log("processing link option");
                element.attr("id", attrs["items"]);
                var chart = new Highcharts.Chart(
                    {
                        chart: {
                            renderTo: element.attr("id"),
                            type: 'scatter',
                            zoomType: 'x'
                        },
                        tooltip: {
                            crosshairs: [true, true],
                            formatter: function () {
                                return JSON.stringify([this.x, this.y, this.point.user, this.point.report, this.point.req_time]);
                            }
                        },
                        series: [{
                            data: scope.items
                        }]
                    }
                );
                scope.$watch("items", function (newValue) {
                    chart.series[0].setData(newValue, true);
                }, true);
            }
        }
    });