/* Main Controller */
angular.module('main').controller('mainController', ['$scope', 'socket', function($scope, socket) {
    $scope.version = 'Beta';
    $scope.message = '';

    socket.on('time', function(timeString) {
        $scope.message = 'Server time: ' + timeString;
    });
}]);