/* Main App Module */
angular.module('main', ['ngRoute'])

    /* Socket Service */
    .factory('socket', function($rootScope) {
        var socket = io.connect();
        return {
            on: function(eventName, callback) {
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    })

    /* Angular Routes */
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl:    '/html/views/login.html',
                controller:     'loginController'
            })
            .when('/compile', {
                templateURL:    '/html/views/compile.html',
                controller:     'mainController'
            })
            .otherwise({
                redirectTo:     '/'
            });
    }]);