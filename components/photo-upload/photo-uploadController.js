'use strict';

cs142App.controller('PhotoUploadController', ['$scope', '$routeParams','$location','$resource','$http','$rootScope','$window','$mdDialog', '$timeout',
    function ($scope, $routeParams, $location, $resource, $http, $rootScope, $window, $mdDialog, $timeout) {

    $scope.photoUpload = [];

    $scope.photoUploadInit = function() {
            $scope.photoUpload.selected = [];
            var userList = [];
            var users = $resource('/user/list', {userId: '@id'});
            $scope.photoUpload.showList = true;

           $scope.photoUpload.specifyButton = false;

            // $scope.user.allPhotos = [];

            users.query({}, function(data) {
                //console.log(allPhotos);
                data.forEach(function(user) {
                    if (user._id !== $scope.main.loginUser._id) {
                        var currentUser = {};
                        currentUser._id = user._id;
                        currentUser.first_name = user.first_name;
                        currentUser.last_name = user.last_name;
                        currentUser.numComments = 0;
                        currentUser.numPhotos = 0;
                        currentUser.comments = [];

                        userList.push(currentUser);
                    }
                });
                $scope.photoUpload.userList = userList;

            });
        };


        var selectedPhotoFile;   // Holds the last file selected by the user

// Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.inputFileNameChanged = function (element) {
            selectedPhotoFile = element.files[0];
            alert("You selected file " + selectedPhotoFile.name + ".");
        };

// Has the user selected a file?
        $scope.inputFileNameSelected = function () {
            return !!selectedPhotoFile;
        };

// Upload the photo file selected by the user using a post request to the URL /photos/new
        $scope.uploadPhoto = function () {
            var promise = $timeout();

            if (!$scope.inputFileNameSelected()) {
                alert("uploadPhoto called with no selected file");
                console.error("uploadPhoto called will no selected file");
                return;
            }

            alert("Are you going to upload " + selectedPhotoFile.name + "?");
            $scope.photoUpload.photoName = selectedPhotoFile.name;
            console.log('fileSubmitted', selectedPhotoFile);

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', selectedPhotoFile);

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function successCallback(response){
                // The photo was successfully uploaded. XXX - Do whatever you want on success.
                console.log(response);
                var photoId = response.data._id;
                //console.log($scope.photoUpload.selected);

                $scope.photoUpload.selected.forEach(function(user) {
/*
                        setTimeout (function(){
                            console.log('Data Saved');
                        },3000);
                        */
                        promise = promise.then(function() {
                            var uploadResource = $resource('/addPhotoPermission/' + photoId);
                            uploadResource.save({user_id:user._id}, function(data){
                                //console.log(data);
                            });
                            return $timeout(100);
                        });

                });

                $rootScope.$broadcast('addPhoto');
                $location.path('/photos-advance/true/' + response.data.user_id+ '/' + response.data._id);
            }, function errorCallback(response){
                // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                console.error('ERROR uploading photo', response);

            });



        };


        $scope.toggle = function(user) {
            var index = $scope.photoUpload.selected.indexOf(user);

            console.log("index " + index);

            if (index === -1) {
                $scope.photoUpload.selected.push(user);
            } else {
                var update = [];
                $scope.photoUpload.selected.forEach(function(everyUser) {
                    if (everyUser._id !== user._id) {
                        update.push(everyUser);
                    }
                });

                $scope.photoUpload.selected = update;
            }
            console.log($scope.photoUpload.selected);

            //console.log( $scope.photoUpload.selected);
        };


        $scope.isChecked = function(user) {
            return $scope.photoUpload.selected.indexOf(user) > -1;
        };

        $scope.doNotSpecify = function () {
            $scope.photoUpload.specifyButton = true;
            $scope.photoUpload.showList = false;
            $scope.photoUpload.selected = [];
            $scope.photoUpload.selected.push($scope.main.loginUser);

        };

        $scope.doSpecify = function () {
            $scope.photoUpload.specifyButton = false;
            $scope.photoUpload.showList = true;
            $scope.photoUpload.selected = [];

        };





    }]);




