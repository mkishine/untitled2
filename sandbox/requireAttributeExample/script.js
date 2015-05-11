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
                $scope.greetingListeners = [];
                $scope.elementListeners = [];
                this.registerElement = function(listener) {
                    $scope.elementListeners.push(listener);
                };
                this.registerGreeting = function(listener) {
                    $scope.greetingListeners.push(listener);
                };
                this.notifyElement = function(label) {
                    $scope.elementListeners.forEach(function(value){
                        value.scope.notify(value.scope, value.element, this);
                    }, label);
                };
                this.notifyGreeting = function(label) {
                    $scope.greetingListeners.forEach(function(value){
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
                    element.text("Greeting: "+scope.label + " ("+scope.label +" "+label+")");
                };
            },
            scope: {
                label: '=',
            },
            link: function (scope, element, attrs, xCtrl) {
                element.css({border: "5px solid red", cursor: "pointer", margin: "5px", padding: "5px"});
                element.text("Greeting: "+scope.label);
                xCtrl.registerGreeting({scope: scope, element: element});
                element[0].onclick = function(){
                    xCtrl.notifyElement(scope.label);
                };
            }
        };
    })
    .directive('elementButton', function() {
        return {
            require: '^x',
            restrict: 'C',
            controller: function($scope) {
                $scope.notify = function(scope, element, label){
                    element.text("Element: "+scope.label + " ("+label +" "+scope.label+")");
                };
            },
            scope: {
                label: '=',
            },
            link: function (scope, element, attrs, xCtrl) {
                element.css({border: "5px solid blue", cursor: "pointer", margin: "5px", padding: "5px"});
                element.text("Element: "+scope.label);
                xCtrl.registerElement({scope: scope, element: element});
                element[0].onclick = function(){
                    xCtrl.notifyGreeting(scope.label);
                };
            }
        };
    })
;