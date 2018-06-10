'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$routeParams','$location','$resource','$http','$rootScope','$window',
    function ($scope, $routeParams, $location, $resource, $http, $rootScope, $window) {
        /*
         * Since the route is specified as '/users/:userId' in $routeProvider config the
         * $routeParams  should have the userId property set with the path from the URL.
         */

        //$scope.main.checkStatus =  $routeParams.checked;
        /*
        console.log('UserDetail of ', userId);

        console.log('window.cs142models.userModel($routeParams.userId)',
            window.cs142models.userModel(userId));
            */

        $scope.login = {};
        $scope.register={};

        $scope.onLogin = function() {
            var userRes = $resource("/admin/login");
            var userName = $scope.login.name;
            var passWord = $scope.login.password;

            if (userName === undefined) {
                $scope.login.loginErrorReminder = "You must enter a login name";
                return;
            }

            if (passWord === undefined) {
                $scope.login.loginErrorReminder = "You must enter a password";
                return;
            }

            var info = {
                login_name: userName,
                password:passWord
            };

            userRes.save(info, function(data) {
                $scope.main.login = true;
                $scope.main.userName = data.first_name;
                $scope.main.loginUser = data;
                $scope.login.name = "";
                $scope.login.password = "";
                $scope.login.loginErrorReminder = "";

                $window.localStorage.setItem("user", $scope.main.loginUser);
                $location.path("/users/" + $scope.main.checkStatus + '/' + data._id);
            }, function errorHandling(err) {
                $scope.login.loginErrorReminder = err.data;
                console.log('Error for login');
            });
        };

        $scope.onRegister = function() {
            if ($scope.register.loginName === undefined || $scope.register.loginName === '') {
                $scope.register.registerErrorReminder = "You must enter a login name";
                return;
            }

            if ($scope.register.password1 === undefined || $scope.register.password1 === '') {
                $scope.register.registerErrorReminder = "You must enter a password";
                return;
            }

            if ($scope.register.password2 === undefined || $scope.register.password2 === '') {
                $scope.register.registerErrorReminder = "You must enter a password";
                return;
            }


            if ($scope.register.password1 !== $scope.register.password2) {
                $scope.register.registerErrorReminder = "The two passwords you entered are not equal";
                return;
            }

            var res = $resource("/user");
            var newUser = {
                login_name: $scope.register.loginName,
                first_name: $scope.register.firstName,
                last_name: $scope.register.lastName,
                description: $scope.register.description,
                location: $scope.register.location,
                occupation :$scope.register.occupation,
                password: $scope.register.password1
            };

            res.save(newUser,function (data) {
                $scope.main.login = true;
                $scope.main.userName = data.first_name;
                $scope.main.loginUser = data;
                $scope.userForm.$setPristine();

                $window.localStorage.setItem("user", $scope.main.loginUser);
                $location.path("/users/" + $scope.main.checkStatus + '/' + data._id);
                console.log($scope.main.loginUser);
            }, function errorHandling(err) {
                $scope.register.registerErrorReminder = err.data;
                console.log('Error for register');
            });

        };





    }]);
