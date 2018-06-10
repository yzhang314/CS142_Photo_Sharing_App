'use strict';


cs142App.controller('UserPhotosAdvanceController', ['$scope', '$routeParams','$location','$resource', '$rootScope','$http','$timeout',
    function($scope, $routeParams, $location, $resource, $rootScope, $http, $timeout) {
        /*
         * Since the route is specified as '/photos/:userId' in $routeProvider config the
         * $routeParams  should have the userId property set with the path from the URL.
         */
        var userId = $routeParams.userId;
        var photoId =  $routeParams.photoId;
        //var index = $routeParams.photoIndex;

        //$scope.main.checkStatus =  $routeParams.checked;
        /*
        console.log('UserPhoto of ', $routeParams.userId);

        console.log('window.cs142models.photoOfUserModel($routeParams.userId)',
           window.cs142models.photoOfUserModel(userId));
           */
        $scope.main.viewName = 'photos';

        $scope.photoAdvance = {};
        /*
        $scope.userPhoto.photos = window.cs142models.photoOfUserModel(userId);
        $scope.userPhoto.user = window.cs142models.userModel(userId);
        $scope.userPhoto.comment = $scope.userPhoto.photos.comment;

        $scope.main.user = window.cs142models.userModel(userId);
        */

        $scope.photoAdvance.photos = {};
        $scope.lengthValue = 0;



        /*
        var url1 = '/photosOfUser/' + userId;


        var callback1 = function (data1) {
            $scope.$apply(function() {
                $scope.photoAdvance.photos = data1;
                $scope.photoAdvance.comment = $scope.photoAdvance.photos.comment;
                $scope.lengthValue = data1.length;
                $scope.photoAdvance.currentPhoto = $scope.photoAdvance.photos[$scope.photoAdvance.index];

            });
        };

        $scope.FetchModel(url1, callback1);
*/

        var Photos = $resource('/photosOfUser/:userId', {userId: '@id'});
        var users = $resource('/user/list', {userId: '@id'});

        $scope.photoAdvanceInit = function() {
            var userList = [];
            $scope.mentionedUser = [];
            // $scope.user.allPhotos = [];

            $scope.photoAdvance.users = [];

            users.query({}, function(data2) {
               data2.forEach(function(user) {
                    var name = user.first_name + " " + user.last_name;
                   $scope.photoAdvance.users.push({label:name, user_id:user._id});
                });
            });

            Photos.query({userId:userId}, function(data1) {
                //console.log(data1);
                data1.sort($scope.sort);
                $scope.photoAdvance.photos = data1;
                //console.log($scope.photoAdvance.photos);
                //$scope.photoAdvance.comment = $scope.photoAdvance.photos.comment;
                $scope.lengthValue = data1.length;
                $scope.photoAdvance.index = 0;
                $scope.photoAdvance.currentPhoto =  $scope.photoAdvance.photos[0];


                for (var i = 0; i < $scope.photoAdvance.photos.length; i++) {
                    if ($scope.photoAdvance.photos[i]._id === photoId) {
                        $scope.photoAdvance.index = i;
                        $scope.photoAdvance.currentPhoto = $scope.photoAdvance.photos[i];
                    }
                }

                if ($scope.photoAdvance.currentPhoto) {
                    $scope.photoAdvance.currentPhoto.likeStatus = false;
                    for (var j = 0; j < $scope.photoAdvance.currentPhoto.like.length; j++) {
                        //console.log("id stored: " + $scope.photoAdvance.currentPhoto.like[j]);
                        //console.log("user id: " + $scope.main.user._id);
                        //console.log("user id: " + $scope.main.loginUser._id);
                        if ($scope.photoAdvance.currentPhoto.like[j] === $scope.main.loginUser._id) {
                            $scope.photoAdvance.currentPhoto.likeStatus = true;
                        }
                    }

                    $scope.photoAdvance.currentPhoto.favoriteStatus = false;
                    for (var k = 0; k < $scope.photoAdvance.currentPhoto.favorites.length; k++) {
                        //console.log("id stored: " + $scope.photoAdvance.currentPhoto.like[j]);
                        //console.log("user id: " + $scope.main.user._id);
                        //console.log("user id: " + $scope.main.loginUser._id);
                        if ($scope.photoAdvance.currentPhoto.favorites[k] === $scope.main.loginUser._id) {
                            $scope.photoAdvance.currentPhoto.favoriteStatus = true;
                        }
                    }
                }


        });

        };


        $scope.update = function() {
            $scope.mentionedUser=[];
            Photos.query({userId:userId}, function(data1) {
                //console.log(data1);

                data1.sort($scope.sort);
                $scope.photoAdvance.photos = data1;
                //console.log($scope.photoAdvance.photos);
                //$scope.photoAdvance.comment = $scope.photoAdvance.photos.comment;
                $scope.lengthValue = data1.length;
                $scope.photoAdvance.currentPhoto =  $scope.photoAdvance.photos[$scope.photoAdvance.index];

                $scope.photoAdvance.index = 0;
                $scope.photoAdvance.currentPhoto =  $scope.photoAdvance.photos[0];

                for (var i = 0; i < $scope.photoAdvance.photos.length; i++) {
                    if ($scope.photoAdvance.photos[i]._id === photoId) {
                        $scope.photoAdvance.index = i;
                        $scope.photoAdvance.currentPhoto = $scope.photoAdvance.photos[i];
                    }
                }

                if ($scope.photoAdvance.currentPhoto) {
                    $scope.photoAdvance.currentPhoto.likeStatus = false;
                    for (var j = 0; j < $scope.photoAdvance.currentPhoto.like.length; j++) {
                        //console.log("id stored: " + $scope.photoAdvance.currentPhoto.like[j]);
                        //console.log("user id: " + $scope.main.user._id);
                        //console.log("user id: " + $scope.main.loginUser._id);
                        if ($scope.photoAdvance.currentPhoto.like[j] === $scope.main.loginUser._id) {
                            $scope.photoAdvance.currentPhoto.likeStatus = true;
                        }
                    }

                    $scope.photoAdvance.currentPhoto.favoriteStatus = false;
                    for (var k = 0; k < $scope.photoAdvance.currentPhoto.favorites.length; k++) {
                        //console.log("id stored: " + $scope.photoAdvance.currentPhoto.like[j]);
                        //console.log("user id: " + $scope.main.user._id);
                        //console.log("user id: " + $scope.main.loginUser._id);
                        if ($scope.photoAdvance.currentPhoto.favorites[k] === $scope.main.loginUser._id) {
                            $scope.photoAdvance.currentPhoto.favoriteStatus = true;
                        }
                    }

                }


            });
            $scope.photoAdvance.photoId = $scope.photoAdvance.photos[$scope.photoAdvance.index]._id;
            $location.path('/photos-advance/' + $scope.main.checkStatus + '/' + $scope.photoAdvance.user._id + '/' + $scope.photoAdvance.photoId, false);

            };




        $scope.sort = function (photo1, photo2) {
            if (photo2.like.length === photo1.like.length) {
                var date1 = photo1.date_time.split(" ");
                var date2 = photo2.date_time.split(" ");
                //console.log("photo1-date " + date1);
                //console.log("photo2-date " + date2);
                var d1 = Date.parse(date1);
                var d2 = Date.parse(date2);
                //console.log("photo1-date " + d1);
                //console.log("photo2-date " + d2);
               // console.log(photo2.date_time - photo1.date_time);
                return d2 - d1;
            }
            return photo2.like.length - photo1.like.length;



        };

        $scope.previous = function() {
            if ($scope.photoAdvance.index > 0) {
                $scope.photoAdvance.index--;
                $scope.photoAdvance.currentPhoto = $scope.photoAdvance.photos[$scope.photoAdvance.index];
                $scope.photoAdvance.photoId = $scope.photoAdvance.photos[$scope.photoAdvance.index]._id;
                $location.path('/photos-advance/' + $scope.main.checkStatus + '/'  + $scope.photoAdvance.user._id + '/' + $scope.photoAdvance.photoId, false);
            }
        };

        $scope.next = function() {
            if ($scope.photoAdvance.index < $scope.lengthValue - 1) {
                $scope.photoAdvance.index++;
                $scope.photoAdvance.currentPhoto = $scope.photoAdvance.photos[$scope.photoAdvance.index];
                $scope.photoAdvance.photoId = $scope.photoAdvance.photos[$scope.photoAdvance.index]._id;
                $location.path('/photos-advance/' + $scope.main.checkStatus + '/' + $scope.photoAdvance.user._id + '/' + $scope.photoAdvance.photoId, false);
            }
        };


        // $scope.photoAdvance.curerntPhoto =  $scope.photoAdvance.photos[0].file_name;

        // var photos = $scope.photoAdvance.photos;
        //
        // console.log(photos);
        /*
                var url2 = '/user/' + userId;

                var callback2 = function (data2) {
                    $scope.$apply(function() {
                        $scope.photoAdvance.user = data2;
                        $scope.main.user = data2;
                    });
                };

                $scope.FetchModel(url2, callback2);
                */
        var User = $resource('/user/:userId', {userId: '@id'});
        User.get({userId:userId}, function(data2) {
            $scope.photoAdvance.user = data2;
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

        $scope.onAddComment = function() {
            //deal with comment
            var comment = $scope.photoAdvance.newComment;

            if (!comment) {
                $scope.photoAdvance.commentErrorReminder = "The comment can't be empty";
            }

            var photoId = $scope.photoAdvance.currentPhoto._id;

            var commentRes = $resource('/commentsOfPhoto/'+ photoId);
            var users = $scope.mentionedUser;

            commentRes.save({comment : comment, users: users}, function (data) {
                $scope.photoAdvance.newComment = '';
               // $scope.update();
               // $rootScope.$broadcast("addComment");
                //console.log(data.comments);
            }, function errHandling(err) {
                console.log('Error for adding the comment');
            });

            //deal with mention
            //console.log($scope.mentionedUser);

            var promise = $timeout();

            users.forEach(function(user){
                promise = promise.then(function() {
                    var mentionResource = $resource('/mention/' + photoId);

                    //console.log(user);
                    mentionResource.save({user_id:user}, function(data){
                        //console.log(data);
                    });

                    return $timeout(100);
                });
                /*
                setTimeout (function(){
                    console.log('Data Saved');
                },3000);
                */
            });



            $scope.update();
            $rootScope.$broadcast("mention");



            $scope.mentionedUser=[];
        };



        $scope.onLike = function(photoId) {
            console.log("like clicked");
            var likeResource = $resource('/likePhoto/' + photoId);
            $scope.photoAdvance.currentPhoto.likeStatus = true;

            likeResource.save({}, function(data){
                //console.log(data);
                $scope.update();
                $rootScope.$broadcast("like");

            });
        };

        $scope.onUnlike = function(photoId) {
            console.log("unlike clicked");
            var unlikeResource = $resource('/likePhoto/' + photoId);
            $scope.photoAdvance.currentPhoto.likeStatus = false;
            unlikeResource.save({}, function(data){
               // console.log(data);
                $scope.update();
                $rootScope.$broadcast("unlike");
            });
        };

        $scope.onDeleteComment = function(photoId, currentComment) {
            console.log("deleteComment clicked");
            //console.log(currentComment._id);
            var deleteResource = $resource('/deleteComment/' + photoId);
            deleteResource.save({comment:currentComment}, function(data){
                //console.log(data);
                $scope.update();
                $rootScope.$broadcast("deleteComment");

            });

        };

        $scope.onDeletePhoto = function(photoId) {
            console.log("deletePhoto clicked");
            alert("All you sure you want to delete curernt photo?");
            var deleteResource = $resource('/deletePhoto/' + photoId);

            deleteResource.save({}, function(data){
                //console.log(data);
                $scope.update();
                $rootScope.$broadcast("deletePhoto");
                $location.path("/users/" + $scope.main.checkStatus + '/' + $scope.main.loginUser._id);
            });

        };

        $scope.getMentionedUser = function (item) {
            //console.log(item);

            $scope.mentionedUser = $scope.mentionedUser.concat(item.user_id);

            return '@' + item.label;
        };

        $scope.onFavorite = function(photoId) {
            console.log("favorite clicked");

           var favoriteResource = $resource('/favoritePhoto/' + photoId);

            $scope.photoAdvance.currentPhoto.favoriteStatus = true;

            //console.log("photoId " + photoId);


            favoriteResource.save({}, function(data){
                console.log(data);
                $scope.update();
                $rootScope.$broadcast("favorite");

            });


        };

        $scope.onUnFavorite = function(photoId) {
            console.log("unFavorite clicked");

            var unFavoriteResource = $resource('/favoritePhoto/' + photoId);
            $scope.photoAdvance.currentPhoto.favoriteStatus  = false;

            unFavoriteResource.save({}, function(data){
                console.log(data);
                $scope.update();
                $rootScope.$broadcast("unFavorite");
            });


        };




    }]);
