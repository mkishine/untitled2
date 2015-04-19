function MyCtrl($scope, limitToFilter) {
    $scope.ideas = [
        ['ideas1', 1],
        ['ideas2', 8],
        ['ideas3', 5]
    ];

    $scope.limitedIdeas = limitToFilter($scope.ideas, 2);
}

angular.module('myApp', [])
    .directive('hcPie', function () {
        return {
            restrict: 'C',
            // see discussion of replace option at
            // http://stackoverflow.com/questions/22497706/angular-directive-replace-true
            replace: true,
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
                console.log(2);
            },
            template: '<div id="container" style="margin: 0 auto">not working</div>',
            // use link option to manipulate DOM
            // see docsTimeDirective example at
            // https://code.angularjs.org/1.2.27/docs/guide/directive
            link: function (scope, element, attrs) {
                console.log(3);
                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'container',
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
    });