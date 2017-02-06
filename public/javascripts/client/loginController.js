/* Login Controller */
angular.module('main').controller('loginController', ['$scope', '$location', '$http', 'data',
    function($scope, $location, $http, data) {
        // form elements
        $scope.user = '';
        $scope.password = '';
        $scope.course = '';
        $scope.quarter = '';
        $scope.assignment = '';

        // form submission
        $scope.compile = function() {
            data.getData().userData = {
                user:       $scope.user,
                password:   $scope.password,
                course:     $scope.course,
                quarter:    $scope.quarter,
                assignment: $scope.assignment
            };

            $http.post('/compile', {
                user:       $scope.user,
                password:   $scope.password,
                course:     $scope.course.toLowerCase(),
                quarter:    $scope.quarter.toUpperCase(),
                assignment: $scope.assignment
            })
            .success(function(data, status, headers, config) {
                $location.path('compile');
            })
            .error(function(data, status, header, config) {
                $scope.error = 'Unable to make POST request.';
            });
    };
}]);