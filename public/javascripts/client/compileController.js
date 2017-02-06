/* Compile Controller */
angular.module('main').controller('compileController', ['$scope', '$http', 'socket', 'data',
    function($scope, $http, socket, data) {
        $scope.debug = false;

        // data from login page
        $scope.userData = data.getData().userData;

        // live updates
        $scope.loading = true;
        $scope.message = '';
        $scope.allSubmissionsLink = '';

        // socket handling
        $scope.emitter = $scope.userData.user + '-' + $scope.userData.password[0] + '-message';
        socket.on($scope.emitter, function(message) {
            $scope.message = message;

            if ($scope.message.startsWith('Finished.')) {
                $scope.loading = false;
                $scope.allSubmissionsLink = '/downloads/' + $scope.userData.user + '/' + $scope.userData.course + '/' +
                                            $scope.userData.quarter + '/' + 'assignment' + $scope.userData.assignment +
                                            '/assignment' + $scope.userData.assignment + '_submissions.zip';
                $scope.message = 'Finished compiling submissions. Please click above to download.';
            }
        });
}]);