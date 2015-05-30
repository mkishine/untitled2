"use strict";
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
                    if (xMin && element.x < xMin)
                        return;
                    if (xMax && element.x > xMax)
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
                for (var k in h) {
                    p.push({
                        name: k,
                        y: h[k]
                    });
                }
                p.sort(function (a, b) {
                    return a.y - b.y;
                });
                p.unshift(p.pop());
                return p;
            }

            function buildHueMap(counts, times) {
                var maxSlices = 5;
                var xx = [];
                xx.pushNew = function (v) {
                    if (this.indexOf(v) == -1) {
                        this.push(v);
                    }
                }
                xx.pushNew(counts[0].name);
                xx.pushNew(times[0].name);
                var len = Math.min(maxSlices, counts.length);
                for (var i = 1; i < len; ++i) {
                    xx.pushNew(counts[counts.length - i].name);
                    xx.pushNew(times[times.length - i].name);
                }
                // console.log(xx);
                var hueMap = {};
                xx.forEach(function (elem, idx, arr) {
                    hueMap[elem] = idx / arr.length * 360;
                });
                return hueMap;
            }

            function compact(pie, hueMap) {
                var newPie = pie.filter(function (p) {
                    return p.name in hueMap
                });
                newPie.forEach(function (p) {
                    p.color = "hsl(" + hueMap[p.name] + ",100%,50%)";
                    p.hue = hueMap[p.name];
                });
                if (newPie.length == pie.length)
                    return newPie;
                var otherVlue = pie.reduce(function reducer(sum, p) {
                    if (p.name in hueMap) {
                        return sum;
                    } else {
                        return sum + p.y;
                    }
                }, 0)
                newPie.push({name: "Other", y: otherVlue, color: "grey"});
                newPie.sort(function (a, b) {
                    return a.y - b.y;
                });
                newPie.unshift(newPie.pop());
                return newPie;
            }

            function collectPieData(xMin, xMax) {
                $scope.userCounts = h2p(counter("user", undefined, xMin, xMax));
                $scope.reportCounts = h2p(counter("report", undefined, xMin, xMax));
                $scope.userTimes = h2p(counter("user", "req_time", xMin, xMax));
                $scope.reportTimes = h2p(counter("report", "req_time", xMin, xMax));

                var userHueMap = $scope.userHueMap;
                if (userHueMap == undefined || !$scope.pieSliceSelected)
                    userHueMap = $scope.userHueMap = buildHueMap($scope.userCounts, $scope.userTimes);
                $scope.userCounts = compact($scope.userCounts, userHueMap);
                $scope.userTimes = compact($scope.userTimes, userHueMap);
                var reportHueMap = $scope.reportHueMap;
                if (reportHueMap == undefined || !$scope.pieSliceSelected)
                    reportHueMap = $scope.reportHueMap = buildHueMap($scope.reportCounts, $scope.reportTimes);
                $scope.reportCounts = compact($scope.reportCounts, reportHueMap);
                $scope.reportTimes = compact($scope.reportTimes, reportHueMap);
            }

            collectPieData(undefined, undefined);
            $scope.pieSliceSelected = false;
            $scope.scatterZoomed = function (xMin, xMax) {
                collectPieData(xMin, xMax);
            };
            $scope.pieClicked = function (name, category, hue) {
                $scope.pieSliceSelected = name != undefined;
            };
        });
    })
    .directive('hcCoordinator', function () {
        return {
            restrict: 'C',
            transclude: true,
            controller: function ($scope) {
                $scope.scatterPlot = {};
                $scope.pieCharts = {};
                this.registerScatterPlot = function (scatterPlot) {
                    $scope.scatterPlot = scatterPlot;
                };
                this.registerPieChart = function (id, pieChart) {
                    $scope.pieCharts[id] = pieChart;
                };
                this.pieClicked = function (name, category, hue) {
                    $scope.pieClicked(name, category, hue);
                    //TODO: no need for scope key
                    $scope.scatterPlot.scope.notify(name, category, hue);
                };
                this.scatterZoomed = function (xMin, xMax) {
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
                $scope.setData = function (data) {
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
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                            //    enabled: true,
                            //    color: '#000000',
                                connectorColor: '#000000',
                            //    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        data: scope.items,
                        point: {
                            events: {
                                click: function () {
                                    if (this.name == "Other")
                                        return false;
                                    var name = this.state == "select" ? undefined : this.name;
                                    coordinator.pieClicked(name, category, this.hue);
                                }
                            }
                        }
                    }]
                });
                coordinator.registerPieChart(scope.id, scope);
                scope.$watch("items", function (data) {
                    scope.chart.series[0].setData(data, true);
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
                $scope.notify = function (name, category, hue) {
                    var highlighting = name ? "Highliting " + category + " " + name : "Removing highlights";
                    $scope.chart.showLoading(highlighting);
                    window.setTimeout(function () {
                        $scope.chart.series[0].data.forEach(function (p) {
                            var saturation = p[category] == name ? '100%' : '0%';
                            var lightness = p.req_time < .5 ? "85%" : (p.req_time > 1.5 ? "35%" : "50%");
                            var pointColor = 'hsl(' + hue + "," + saturation + "," + lightness + ")";
                            p.update({
                                color: pointColor
                            }, false, false)
                        });
                        $scope.chart.redraw();
                        $scope.chart.hideLoading();
                        var selection = name ? category + " " + name : "none";
                        var subtitle = {text: "Selection: " + selection};
                        $scope.chart.setTitle(undefined, subtitle);
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
                        credits: {
                            enabled: false
                        },
                        title : {
                            text : "Title"
                        },
                        subtitle : {
                            text : "Selection: none"
                        },
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
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            scatter: {
                                animation: false,
                                turboThreshold: 0
                            },
                            series: {
                                marker: {
                                    states: {
                                        hover: {
                                            fillColor: function () {
                                            } //color marker the same as point
                                        }
                                    }
                                },
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
                scope.$watch("items", function (data) {
                    if (data === undefined)
                        return;
                    var seriesData = scope.chart.series[0].data;
                    if (seriesData.length != 0)
                        return;
                    data.forEach(function (p) {
                        var l = p.req_time < .5 ? "85%" : (p.req_time > 1.5 ? "35%" : "50%");
                        p.color = "hsl(0,0%," + l + ")";
                    });
                    scope.chart.series[0].setData(data, true);
                }, true);
            }
        }
    });