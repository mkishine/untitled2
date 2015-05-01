angular.module('t2', [])
    .controller('ctrl', ['$scope', function($scope) {
        $scope.l1 = "hello";
        $scope.l2 = "world";
    }])
    .directive('myButton', function() {
        return {
            require: '^myName',
            restrict: 'C',
            scope: {
                label: '=',
            },
            link: function (scope, element, attrs, nameCtrl) {
                element.text(scope.label);
                element[0].onclick = function(){
                    console.log(scope.label + " clicked");
                    nameCtrl.sayName(scope.label);
                };
            }
        };
    })
    .directive('myName', function() {
        return {
            restrict: 'C',
            controller: function($scope) {
                this.sayName = function(label) {
                    console.log("my name is "+label);
                }
            }
        };
    })
;