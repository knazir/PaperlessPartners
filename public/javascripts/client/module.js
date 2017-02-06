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

    /* Data service for passing between controllers */
    .service('data', function() {
        data = {};

        return {
            getData: function() {
                return data;
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
                templateUrl:    '/html/views/compile.html',
                controller:     'compileController'
            })
            .otherwise({
                redirectTo:     '/'
            });
    }]);