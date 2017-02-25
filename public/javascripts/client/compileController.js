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
            $scope.allSubmissionsLink = '/#/';
            $scope.loading = false;
            $scope.message = 'Please search from the home page to compile submissions.';

            var button = document.getElementById('loading_button');
            button.innerHTML = 'Home';
            button.className = 'btn btn-lg btn-primary';

            return;
        }

        // Live updates on progress
        $scope.emitter = $scope.userData.user + '-' + $scope.userData.password[0] + '-message';

        socket.on($scope.emitter, function(message) {
            $scope.message = message;

            if ($scope.message.startsWith('Finished.')) {
                $scope.loading = false;
                var token = data.getData().userData.token;
                var fileLocation = $scope.userData.user + '/' + $scope.userData.course.toLowerCase() + '/' +
                                   $scope.userData.quarter.toUpperCase() + '/' + 'assignment' +
                                   $scope.userData.assignment + '/assignment' + $scope.userData.assignment +
                                   '_submissions.zip';

                var link = window.location.protocol + "//" + window.location.host + "/download";
                link += '?token=' + token + '&location=' + fileLocation;
                $scope.allSubmissionsLink = link;

                var button = document.getElementById('loading_button');
                button.className = 'btn btn-lg btn-primary';
                button.onclick = function() {
                    window.location.href = link;
                };

                $scope.message = 'Finished. Click above to download the compiled submissions.';
            }
        });

        $scope.gotoDownloadLink = function() {
            $http.post('/download', {
                location: $scope.allSubmissionsLink
            })
            .success(function(data, status, headers, config) {
                console.log('Successfully received file.');
            })
            .error(function(data, status, header, config) {
                $scope.message = 'An error occurred. Please contact knazir@stanford.edu.';
            });
        };
}]);