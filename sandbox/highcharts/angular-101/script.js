angular.module('myApp', [])
    .controller("MyCtrl", function ($scope, $http) {
        var promise = $http.get("data.json");
        promise.success(function (data) {
            // display first 100 points
            // data.splice(-900,900);
            $scope.data = data;
            function counter(key, what, xMin, xMax) {
                var count = {};
                data.forEach(function (element) {
                    if ( xMin && element.x < xMin)
                        return;
                    if ( xMax && element.x > xMax)
                        return;
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
                    p.push({
                        name:k,
                        y:h[k]
                    });
                    if (max === undefined)
                        max = h[k];
                    else
                        max = Math.max(max, h[k]);
                }
                p.sort(function (a, b) {
                    var aa = a.y == max ? a.y : -a.y;
                    var bb = b.y == max ? b.y : -b.y;
                    return bb - aa;
                });
                return p;
            }
            function collectPieData(xMin, xMax) {
                $scope.userCounts = h2p(counter("user", undefined, xMin, xMax));
                $scope.reportCounts = h2p(counter("report", undefined, xMin, xMax));
                $scope.userTimes = h2p(counter("user", "req_time", xMin, xMax));
                $scope.reportTimes = h2p(counter("report", "req_time", xMin, xMax));
            }
            collectPieData(undefined, undefined);

            $scope.scatterZoomed = function(xMin, xMax){
                collectPieData(xMin, xMax);
            };
        });
    })
    .directive('hcCoordinator', function() {
        return {
            restrict: 'C',
            transclude: true,
            controller: function($scope) {
                $scope.scatterPlot = {};
                $scope.pieCharts = {};
                this.registerScatterPlot = function(scatterPlot) {
                    $scope.scatterPlot = scatterPlot;
                };
                this.registerPieChart = function(id, pieChart) {
                    $scope.pieCharts[id] = pieChart;
                };
                this.pieClicked = function(name, category, color) {
                    //TODO: no need for scope key
                    $scope.scatterPlot.scope.notify(name, category, color);
                };
                this.scatterZoomed = function(xMin, xMax){
                    $scope.scatterZoomed(xMin, xMax);
                    for (var id in $scope.pieCharts) {
                        var data = $scope[id];
                        $scope.pieCharts[id].setData(data);
                    }
                };
            }
        };
    })
    .directive('hcPie', function () {
        return {
            require: '^hcCoordinator',
            restrict: 'EC',
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
                $scope.setData = function(data){
                    this.chart.series[0].setData(data, true);
                }
            },
            template: '<div id="container" style="margin: 0 auto">not working</div>',
            // use link option to manipulate DOM
            // see docsTimeDirective example at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            link: function (scope, element, attrs, coordinator) {
                scope.id = attrs["items"];
                element.attr("id", scope.id);
                var title = attrs["title"] || "";
                var category = attrs["category"] || "";
                scope.chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element.attr("id"),
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: title
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.1f}%</b>',
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
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        data: scope.items,
                        point: {
                            events: {
                                click: function() {
                                    coordinator.pieClicked(this.name, category, this.color);
                                }
                            }
                        }
                    }]
                });
                coordinator.registerPieChart(scope.id, scope);
                scope.$watch("items", function (newValue) {
                    scope.chart.series[0].setData(newValue, true);
                }, true);

            }
        }
    })
    .directive('hcScatter', function () {
        return {
            require: '^hcCoordinator',
            restrict: 'EC',
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
                $scope.notify = function(name, category, color){
                    $scope.chart.showLoading(
                        "Highliting "+category + " "+name);
                    window.setTimeout(function(){
                        $scope.chart.series[0].data.forEach(function (p) {
                            var pointColor = p[category] == name ? color : 'gray';
                            p.update({
                                color: pointColor,
                            }, false, false)
                        });
                        $scope.chart.redraw();
                        $scope.chart.hideLoading();
                    }, 0);
                };
            },
            template: '<div id="container" style="margin: 0 auto">not working</div>',
            // use link option to manipulate DOM
            // see docsTimeDirective example at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            link: function (scope, element, attrs, coordinator) {
                element.attr("id", attrs["items"]);
                //TODO: no need for scope and element keys
                coordinator.registerScatterPlot({scope: scope, element: element});
                scope.chart = new Highcharts.Chart(
                    {
                        chart: {
                            renderTo: element.attr("id"),
                            type: 'scatter',
                            zoomType: 'x',
                            events: {
                                selection: function (event) {
                                    var xMin = event.xAxis ? event.xAxis[0].min : undefined;
                                    var xMax = event.xAxis ? event.xAxis[0].max : undefined;
                                    coordinator.scatterZoomed(xMin, xMax);
                                }
                            }
                        },
                        plotOptions: {
                            scatter: {
                                animation: false,
                                turboThreshold: 0
                            }
                        },
                        tooltip: {
                            crosshairs: [true, true],
                            formatter: function () {
                                return JSON.stringify([this.x, this.y, this.point.user, this.point.report, this.point.req_time]);
                            }
                        },
                        series: [{
                            color: 'gray',
                            data: scope.items
                        }]
                    }
                );
                scope.$watch("items", function (newValue) {
                    scope.chart.series[0].setData(newValue, true);
                }, true);
            }
        }
    });