/* Login Controller */
angular.module('main').controller('loginController', ['$scope', 'socket', function($scope, socket) {
    $scope.version = 'Beta';
    $scope.message = '';

    socket.on('time', function(timeString) {
        $scope.message = 'Server time: ' + timeString;
    });
}]);