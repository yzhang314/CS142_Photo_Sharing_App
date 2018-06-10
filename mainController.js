'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial','ngResource','mentio']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users//', {
            templateUrl: 'components/user-list/user-listTemplate.html',
            controller: 'UserListController'
            }).
            when('/users/:checked/', {
            templateUrl: 'components/user-list/user-listTemplate.html',
            controller: 'UserListController'
             }).
            when('/users/:checked/:userId/', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/users/comments/:checked/:userId/', {
                templateUrl: 'components/user-comments/user-commentsTemplate.html',
                controller: 'UserCommentsController'
            }).
            when('/photos/:checked/:userId/', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/photos-advance/:checked/:userId/:photoId/', {
                templateUrl: 'components/user-photos-advanced/user-photosTemplate-advance.html',
                controller: 'UserPhotosAdvanceController'
            }).
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            when('/favorites/:userId/', {
            templateUrl: 'components/favorite/favoriteTemplate.html',
            controller: 'FavoriteController'
            }).
            when('/photo-upload/:userId/', {
                templateUrl: 'components/photo-upload/photo-uploadTemplate.html',
                controller: 'PhotoUploadController'
            }).

            otherwise({
                redirectTo: '/users/:checked/'
            });


    }]);

cs142App.controller('MainController', ['$scope','$routeParams','$location','$window','$resource','$rootScope','$http',
    function ($scope, $routeParams, $location, $window, $resource, $rootScope, $http) {

        $scope.main = {};
        $scope.main.title = 'Users';

        $scope.parameters = $routeParams;
        $scope.main.login =false;


        /*
 * FetchModel - Fetch a model from the web server.
 *   url - string - The URL to issue the GET request.
 *   doneCallback - function - called with argument (model) when the
 *                  the GET request is done. The argument model is the
 *                  objectcontaining the model. model is undefined in
 *                  the error case.
 */

        $rootScope.$on("$routeChangeStart", function(event, next, current) {
            if (!$scope.main.login) {
                var currentUser = $window.localStorage.getItem('user');
                if (currentUser !== null) {
                    var userSent = {login_name: currentUser.login_name};
                    $http.post('/admin/login', JSON.stringify(userSent)).then(function (response) {
                        if (response) {
                            $scope.main.loginUser = response.data;
                            $scope.main.login = true;
                            $scope.main.userName = $scope.main.loginUser.first_name;
                            $location.path("/users/" + $scope.main.checkStatus + '/' + $scope.main.loginUser._id);
                        }
                    }, function errorHandling(err) {
                        console.log(err.data);
                    });
                }

                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
            }
        });



        var version = $resource('/test/info');
        version.get({}, function(versionData) {
            $scope.main.version = versionData.__v;
        });

        $scope.main.checkStatus = true;


        //get rid of the advanced feature to make my app easier.
        /*
        $scope.init = function (){
           //console.log($window.localStorage.getItem("status"));
            if ($window.localStorage.getItem("status") === 'true') {
                $scope.main.checkStatus = true;
            } else if ($window.localStorage.getItem("status") === 'false'){
                $scope.main.checkStatus = false;
            }
           // $scope.main.checkStatus = $window.localStorage.getItem("status");
        };



        $scope.$watch("main.checkStatus", function(newValue, oldValue){
            if (oldValue === newValue) {
                return;
            }
            if (newValue === false) {
                //console.log($scope.main.checkStatus);
                $window.localStorage.setItem("status", false);
                $scope.main.checkStatus = false;
                $location.path('/users/false/', false);
            } else {
                $scope.main.checkStatus = true;
                $window.localStorage.setItem("status", true);
                $location.path('/users/true/', false);
                //console.log($scope.main.checkStatus);
            }
        });
           */

        $scope.onLogout = function() {
            var userRes = $resource("/admin/logout");

            userRes.save({}, function() {
                $scope.main.login = false;
                $scope.main.userName = "";
                $scope.main.loginUser = null;
                $scope.main.user = null;
                $window.localStorage.setItem("user", null);
                $location.path("/login-register/");
            }, function errorHandling(err) {
                console.log(err);
            });
        };



        $scope.onFavoriteList = function() {
            $location.path('/favorites/' + $scope.main.loginUser._id);
        };

        $scope.goToUpload = function() {
            $location.path('/photo-upload/' + $scope.main.loginUser._id);
        };



    }]);





