'use strict';

cs142App.controller('UserCommentsController', ['$scope', '$routeParams','$location','$resource','$rootScope', '$window',
    function ($scope, $routeParams, $location, $resource, $rootScope, $window) {
        /*
         * Since the route is specified as '/users/:userId' in $routeProvider config the
         * $routeParams  should have the userId property set with the path from the URL.
         */
        var userId = $routeParams.userId;

        $scope.userComment = {};

        $scope.main.viewName = 'user';


        $scope.userCommentInit = function() {
            var User = $resource('/user/:userId', {userId: '@id'});
            User.get({userId:userId}, function(data) {
                $scope.userComment.user = data;
                $scope.main.user = data;
            });
            var currentUserComments = [];
            var users = $resource('/user/list', {userId: '@id'});

            users.query({}, function(data) {
                data.forEach(function(user) {
                    var Photos = $resource('/photosOfUser/:userId');
                    Photos.query({userId:user._id}, function(data1) {
                        data1.forEach(function (eachPhoto) {
                            var currentComments = eachPhoto.comments;
                            currentComments.forEach(function (comment) {
                                if(comment.user._id === userId) {
                                    var commentObj = {};
                                    commentObj._id = comment._id;
                                    commentObj.myComment = comment.comment;
                                    commentObj.imageName = eachPhoto.file_name;
                                    commentObj.photoId = eachPhoto._id;
                                    commentObj.imageId = eachPhoto._id;
                                    commentObj.date_time = comment.date_time;
                                    commentObj.user = comment.user;
                                    commentObj.photoBy = user;
                                    currentUserComments.push(commentObj);
                                }

                            });
                        });
                    });
                });
            });
            $scope.userComment.comments =  currentUserComments;
        };


        $scope.onDeleteComment2 = function(currentComment,photoId) {
            console.log("deleteComment clicked");
            console.log(photoId);
            console.log(currentComment);
            var deleteResource = $resource('/deleteComment/' + photoId);
            deleteResource.save({comment:currentComment}, function(data){
                //console.log(data);
                //console.log(data);
                $scope.userCommentInit();
                $rootScope.$broadcast("deleteComment");
            });


        };




    }]);
