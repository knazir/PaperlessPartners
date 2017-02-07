/* Compile Controller */
angular.module('main').controller('compileController', ['$scope', '$http', 'socket', 'data',
    function($scope, $http, socket, data) {
        $scope.debug = true;

        // live updates
        $scope.invalid = false;
        $scope.loading = true;
        $scope.message = 'Spinning up child process.';
        $scope.allSubmissionsLink = '';

        // data from login page
        $scope.userData = data.getData().userData;
        if ($scope.userData === undefined) {
            $scope.invalid = true;
            $scope.loading = false;
            $scope.message = 'Please search from the home page to compile submissions.';

            var button = document.getElementById('loading_button')
            button.innerHTML = 'X';
            button.className = 'btn btn-lg btn-primary';

            return;
        }

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
                document.getElementById('loading_button').className = 'btn btn-lg btn-primary';
            }
        });
}]);