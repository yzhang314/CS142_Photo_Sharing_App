'use strict';

cs142App.controller('UserListController', ['$scope','$resource',
    function ($scope, $resource) {
        $scope.main.title = 'Users';

        //console.log('window.cs142models.userListModel()', window.cs142models.userListModel());
        $scope.user = {};


        //$scope.user.userList = window.cs142models.userListModel();
/*
        var callback = function (data) {
            $scope.$apply(function() {
                $scope.user.userList = data;

            });
        };

        $scope.FetchModel('/user/list', callback);
        */


        $scope.userListInit = function() {
            var userList = [];
            var users = $resource('/user/list', {userId: '@id'});

            // $scope.user.allPhotos = [];

            users.query({}, function(data) {
                //console.log(allPhotos);
                data.forEach(function(user) {
                    var currentUser = {};
                    currentUser._id = user._id;
                    currentUser.first_name = user.first_name;
                    currentUser.last_name = user.last_name;
                    currentUser.numComments = 0;
                    currentUser.numPhotos = 0;
                    currentUser.comments = [];

                    var Photos = $resource('/photosOfUser/:userId');
                    Photos.query({userId:currentUser._id}, function(data1) {
                        currentUser.numPhotos = data1.length;
                        if (currentUser.numPhotos === 0) {
                            return;
                        }
                        currentUser.firstPhotoId = data1[0]._id;
                    });

                    users.query({}, function(data2) {
                        data2.forEach(function(user1){
                            Photos.query({userId:user1._id}, function(data3) {
                                data3.forEach(function(eachPhoto) {
                                    var currentComments = eachPhoto.comments;
                                    currentComments.forEach(function (comment) {
                                        if(comment.user._id === currentUser._id) {
                                            currentUser.comments.push(comment);
                                            currentUser.numComments++;
                                        }
                                    });
                                });
                            });
                        });

                    });

                    userList.push(currentUser);

                });
                $scope.user.userList = userList;

            });
        };

        $scope.$on('deletePhoto', function(){
            $scope.userListInit();
        });

        $scope.$on('deleteComment', function(){
            $scope.userListInit();
        });


        $scope.$on('addComment', function() {
            $scope.userListInit();
        });

        $scope.$on('addPhoto', function() {
            $scope.userListInit();
        });


        /*
                userList.forEach(function(user) {
                  totalCommentList.forEach(function (comment) {

                      if (comment.user._id === user._id) {
                          user.numComments++;
                      }

                    });
                  user.numComments = 1;
                });
        */




    }]);

