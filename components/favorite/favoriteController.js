'use strict';

    cs142App.controller('FavoriteController', ['$scope', '$routeParams','$location','$resource','$http','$rootScope','$window','$mdDialog',
    function ($scope, $routeParams, $location, $resource, $http, $rootScope, $window, $mdDialog, Lightbox) {

        $scope.favorite = [];

        $scope.favoriteInit = function() {
            var userId = $scope.main.loginUser._id;
            var User = $resource('/user/:userId', {userId: '@id'});
            var Favorites = $resource('/getFavorite/' + userId);

            Favorites.query({userId: userId}, function (data) {
                console.log(data);
                var favoriteList = [];
                data.forEach(function (everyFavorite) {
                    var favoriteInfo = {};
                    favoriteInfo.file_name = everyFavorite.file_name;
                    favoriteInfo.photo_id = everyFavorite.photo_id;
                    favoriteInfo.date_time = everyFavorite.date_time;
                    User.get({userId: everyFavorite.photo_by}, function (data3) {
                        favoriteInfo.user = data3;
                    });
                    favoriteList.push(favoriteInfo);
                });

                $scope.favorite.favorites = favoriteList;
                console.log($scope.favorite.favorites);

            });
        };

        $scope.showModal = function(image){
            $mdDialog.show({
                locals: { image: image},
                clickOutsideToClose:true,
                templateUrl: '/components/favorite/modalTemplate.html',
                controller: ['$scope', 'image', function($scope,image) {
                    $scope.modalImage = image;
                }]
            });




        };

        $scope.onDeleteFavorite = function(favorite) {
            var photoId = favorite.photo_id;
            alert("Are you sure you want to delete the photo from your favorite list?");
            console.log("unFavorite clicked");
            var unFavoriteResource = $resource('/favoritePhoto/' + photoId);

            unFavoriteResource.save({}, function(data){
                console.log(data);
                $scope.favoriteInit();
                $rootScope.$broadcast("unFavorite");
            });

        };








    }]);




