/* Compile Controller */
angular.module('main').controller('compileController', ['$scope', 'socket', 'data', function($scope, socket, data) {
    $scope.debug = true;

    $scope.loading = true;

    $scope.user = data.getData().user;
    $scope.password = data.getData().password;

    // $scope.message = '';
    // $scope.emitter = $scope.user + '-' + $scope.password[0] + '-message';
    // socket.on($scope.emitter, function(message) {
    //     $scope.message = message;
    // });
}]);