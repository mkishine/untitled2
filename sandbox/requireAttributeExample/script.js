angular.module('t2', [])
    .controller('ctrl', ['$scope', function($scope) {
        $scope.hello = "hello";
        $scope.hi = "hi";
        $scope.earth = "earth";
        $scope.fire = "fire";
        $scope.water = "water";
    }])
    .directive('x', function() {
        return {
            restrict: 'C',
            controller: function($scope) {
                $scope.listeners = [];
                this.register = function(listener) {
                    $scope.listeners.push(listener);
                };
                this.notify = function(label) {
                    // console.log("x notified: "+label);
                    $scope.listeners.forEach(function(value){
                        value.scope.notify(value.scope, value.element, this);
                    }, label);
                };
            }
        };
    })
    .directive('greetingButton', function() {
        return {
            require: '^x',
            restrict: 'C',
            controller: function($scope) {
                $scope.notify = function(scope, element, label){
                    // console.log("Greeting notified: "+label);
                    element.text("Greeting: "+scope.label + " ("+scope.label +" "+label+")");
                };
            },
            scope: {
                label: '=',
            },
            link: function (scope, element, attrs, xCtrl) {
                element.css({border: "5px solid", cursor: "pointer", margin: "5px"});
                element.text("Greeting: "+scope.label);
                xCtrl.register({scope: scope, element: element});
                element[0].onclick = function(){
                    console.log(scope.label + " clicked");
                };
            }
        };
    })
    .directive('elementButton', function() {
        return {
            require: '^x',
            restrict: 'C',
            scope: {
                label: '=',
            },
            link: function (scope, element, attrs, xCtrl) {
                element.css({border: "5px solid", cursor: "pointer", margin: "5px"});
                element.text("Element: "+scope.label);
                element[0].onclick = function(){
                    // console.log(scope.label + " clicked");
                    xCtrl.notify(scope.label);
                };
            }
        };
    })
;