/* Login Controller */
angular.module('main').controller('loginController', ['$scope', '$location', 'socket', 'data',
    function($scope, $location, socket, data) {
        $scope.user = '';
        $scope.password = '';

        $scope.compile = function() {
            data.getData().user = $scope.user;
            data.getData().password = $scope.password;
            $location.path('compile');
        };
}]);