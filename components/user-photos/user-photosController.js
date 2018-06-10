'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$location','$resource', '$rootScope',
  function($scope, $routeParams,$location, $resource,$rootScope) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    //$scope.main.checkStatus =  $routeParams.checked;
    /*
    console.log('UserPhoto of ', $routeParams.userId);

    console.log('window.cs142models.photoOfUserModel($routeParams.userId)',
       window.cs142models.photoOfUserModel(userId));
       */
      $scope.main.viewName = 'photos';

    $scope.userPhoto = {};
    /*
    $scope.userPhoto.photos = window.cs142models.photoOfUserModel(userId);
    $scope.userPhoto.user = window.cs142models.userModel(userId);
    $scope.userPhoto.comment = $scope.userPhoto.photos.comment;

    $scope.main.user = window.cs142models.userModel(userId);
    */
/*
      var url1 = '/photosOfUser/' + userId;

      var callback1 = function (data1) {
          $scope.$apply(function() {
              $scope.userPhoto.photos = data1;
              $scope.userPhoto.comment = $scope.userPhoto.photos.comment;
          });
      };

      $scope.FetchModel(url1, callback1);
      */

      var Photos = $resource('/photosOfUser/:userId', {userId: '@id'});
      Photos.query({userId:userId}, function(data1) {
          $scope.userPhoto.photos = data1;
          $scope.userPhoto.comment = $scope.userPhoto.photos.comment;
          $scope.userPhoto.firstPhoto = $scope.userPhoto.photos[0];
      });

      $scope.onAddComment = function(currentPhoto) {
          var comment = $scope.userPhoto.newComment;

          if (!comment) {
              $scope.userPhoto.commentErrorReminder = "The comment can't be empty";
          }

          var photoId = currentPhoto._id;

          var commentRes = $resource('/commentsOfPhoto/'+ photoId);

          commentRes.save({comment : comment}, function (data) {
              $scope.userPhoto.newComment = '';
              Photos.query({userId:userId}, function(data1) {
                  $scope.userPhoto.photos = data1;
                  $scope.userPhoto.comment = $scope.userPhoto.photos.comment;
                  $scope.userPhoto.firstPhoto = $scope.userPhoto.photos[0];
              });
              $rootScope.$broadcast("addComment");
              //console.log(data.comments);
          }, function errHandling(err) {
              console.log('Error for adding the comment');
          });

      };

      /*
      var url2 = '/user/' + userId;

      var callback2 = function (data2) {
          $scope.$apply(function() {
              $scope.userPhoto.user = data2;
              $scope.main.user = data2;
          });
      };

      $scope.FetchModel(url2, callback2);
      */

      var User = $resource('/user/:userId', {userId: '@id'});
      User.get({userId:userId}, function(data2) {
          $scope.userPhoto.user = data2;
          $scope.main.user = data2;
      });

      $scope.$watch("main.checkStatus", function(newValue, oldValue){
          if (oldValue === newValue) {
              return;
          }
          if (newValue === false) {
              $location.path('/photos/false/' + userId);
          } else {
              $location.path('/photos-advance/true/' + userId + '/' + $scope.userPhoto.firstPhoto);
          }

      });


  }]);
