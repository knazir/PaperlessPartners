/* Login Controller */
angular.module('main').controller('loginController', ['$scope', '$location', '$http', 'data',
    function($scope, $location, $http, data) {
        // form elements
        $scope.user = '';
        $scope.password = '';
        $scope.course = '';
        $scope.quarter = '';
        $scope.assignment = '';

        $scope.createToken = function() {
            return Math.random().toString(36).replace(/[^a-z]+/g, '');
        };

        // error handling
        $scope.hasErrors = function() {
            var missingElements = [];

            if ($scope.user === '') {
                missingElements.push('sunet');
            }

            if ($scope.password === '') {
                missingElements.push('password');
            }

            if ($scope.course === '') {
                missingElements.push('course');
            }

            if ($scope.quarter === '') {
                missingElements.push('quarter');
            }

            if ($scope.assignment === '') {
                missingElements.push('assignment');
            }

            if (missingElements.length > 0) {
                $scope.error = missingElements.join(', ');
                return true;
            } else {
                return false;
            }
        };

        // form submission
        $scope.compile = function() {
            if ($scope.hasErrors()) {
                return;
            }

            var uniqueToken = $scope.createToken();

            data.getData().userData = {
                user:       $scope.user,
                password:   $scope.password,
                course:     $scope.course,
                quarter:    $scope.quarter,
                assignment: $scope.assignment,
                token:      uniqueToken
            };

            $http.post('/compile', {
                user:       $scope.user,
                password:   $scope.password,
                course:     $scope.course.toLowerCase(),
                quarter:    $scope.quarter.toUpperCase(),
                assignment: $scope.assignment,
                token:      uniqueToken
            })
            .success(function(data, status, headers, config) {
                $location.path('compile');
            })
            .error(function(data, status, header, config) {
                $scope.error = 'Unable to make request to server.';
            });
    };
}]);