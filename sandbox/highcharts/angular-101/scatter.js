angular.module('myApp', [])
    .controller("MyCtrl", function ($scope, $http) {
        var promise = $http.get("data.json");
        promise.success(function (data) {
            $scope.data = data;
        });
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