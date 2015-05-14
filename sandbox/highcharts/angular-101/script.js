angular.module('myApp', [])
    .controller("MyCtrl", function ($scope, $http) {
        var promise = $http.get("data.json");
        promise.success(function (data) {
            // display first 100 points
            // data.splice(-900,900);
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

            $scope.userCounts = h2p(counter("user"));
            $scope.reportCounts = h2p(counter("report"));
            $scope.userTimes = h2p(counter("user", "req_time"));
            $scope.reportTimes = h2p(counter("report", "req_time"));

        });
    })
    .directive('hcCoordinator', function() {
        return {
            restrict: 'C',
            controller: function($scope) {
                $scope.scatterPlot = {};
                this.registerScatterPlot = function(scatterPlot) {
                    $scope.scatterPlot = scatterPlot;
                };
                this.pieClicked = function(name, category, color) {
                    $scope.scatterPlot.scope.notify(name, category, color);
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
            },
            template: '<div id="container" style="margin: 0 auto">not working</div>',
            // use link option to manipulate DOM
            // see docsTimeDirective example at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            link: function (scope, element, attrs, coordinator) {
                element.attr("id", attrs["items"]);
                var title = attrs["title"] || "";
                var category = attrs["category"] || "";
                var chart = new Highcharts.Chart({
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
                scope.$watch("items", function (newValue) {
                    chart.series[0].setData(newValue, true);
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
                    console.log("scatter notify: "+name+" "+category+" "+color);
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
                coordinator.registerScatterPlot({scope: scope, element: element});
                scope.chart = new Highcharts.Chart(
                    {
                        chart: {
                            renderTo: element.attr("id"),
                            type: 'scatter',
                            zoomType: 'x',
                            events: {
                                selection: function (event) {
                                    if (event.xAxis) {
                                        console.log("zoomed: " + event.xAxis[0].min + " " + event.xAxis[0].max);
                                    } else {
                                        console.log('Selection reset');
                                    }
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