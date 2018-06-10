'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams','$location','$resource','$rootScope', '$window',
  function ($scope, $routeParams, $location, $resource, $rootScope, $window) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    //$scope.main.checkStatus =  $routeParams.checked;
    /*
    console.log('UserDetail of ', userId);

    console.log('window.cs142models.userModel($routeParams.userId)',
        window.cs142models.userModel(userId));
        */

    $scope.userDetail = {};

    // $scope.userDetail.user = window.cs142models.userModel(userId);
    // $scope.main.user = window.cs142models.userModel(userId);


    $scope.main.viewName = 'user';

    /*
    var url = '/user/' + userId;

    var callback = function (data) {
      $scope.$apply(function() {
          $scope.userDetail.user = data;
          $scope.main.user = data;
      });
    };

    $scope.FetchModel(url, callback);
    */

    $scope.userDetailInit = function() {
        var User = $resource('/user/:userId', {userId: '@id'});
        User.get({userId:userId}, function(data) {
            $scope.userDetail.user = data;
            $scope.main.user = data;
        });

        var Photos = $resource('/photosOfUser/:userId', {userId: '@id'});
        Photos.query({userId:userId}, function(data1) {
            $scope.userDetail.photos = data1;
            $scope.userDetail.firstPhoto = $scope.userDetail.photos[0];
        });

        var Mentions = $resource('/getMention/' + userId);

        Mentions.query({userId:userId}, function(data2) {
            console.log(data2);
            var mentionList = [];
            data2.forEach(function(everyMention) {
                var mentionInfo = {};
                mentionInfo.file_name = everyMention.file_name;
                mentionInfo.photo_id = everyMention.photo_id;
                User.get({userId:everyMention.photo_by}, function(data3) {
                    mentionInfo.user = data3;
                });
                mentionList.push(mentionInfo);
            });

            $scope.userDetail.mentions = mentionList;
            console.log($scope.userDetail.mentions);

        });
    };



      $scope.onDeleteUser = function() {
          console.log("deleteUser clicked");
          alert("You are going to delete your user profile with all your photos, comments and etc.");

          var deleteUserResource = $resource('/deleteUser/');
          deleteUserResource.save({userId: $scope.main.loginUser._id}, function(data){
              //console.log(data);
              //console.log(data);
          });
          $scope.main.login = false;
          $scope.main.userName = "";
          $window.localStorage.setItem("user", null);
          $location.path("/login-register/");
          /*

          var userRes = $resource("/admin/logout");
          userRes.save({}, function() {
              $scope.main.login = false;
              $scope.main.userName = "";
              $window.localStorage.setItem("user", null);
              $location.path("/login-register/");
          }, function errorHandling(err) {
              console.log(err);
          });
          */



      };




  }]);
