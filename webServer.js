"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var cs142password = require('./cs142password.js');
var fs = require("fs");

var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');


// XXX - Your submission should work without this line
//var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    //console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            //console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */

app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    User.find({}, function(err, data) {
        if (err|| data === null) {
            console.log('User list not found.');
            response.status(400).send('Not found');
            return;
        }

        var users = JSON.parse(JSON.stringify(data));
        var userList = [];
        async.each(users, function (user) {
            var currentUser = {};
            userList.push(currentUser);
            currentUser._id = user._id;
            currentUser.first_name = user.first_name;
            currentUser.last_name = user.last_name;
        },function (error) {
            if (error) {
                response.status(500).send(JSON.stringify(error));
            }
        });
        response.status(200).send(JSON.stringify(userList));
    });

    //response.status(200).send(cs142models.userListModel());

});


/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }
    var id = request.params.id;
    User.find({_id:id }, function (err, data){
        if (err || data === null) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        var currentUser = JSON.parse(JSON.stringify(data[0]));

        var userInfo = {};
        userInfo._id = currentUser._id;
        userInfo.first_name = currentUser.first_name;
        userInfo.last_name = currentUser.last_name;
        userInfo.location = currentUser.location;
        userInfo.description = currentUser.description;
        userInfo.occupation = currentUser.occupation;

        //console.log(data);
        response.status(200).send(JSON.stringify(userInfo));
    });
    /*
        var user = cs142models.userModel(id);
        if (user === null) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        response.status(200).send(user);
    */
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */

app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var id = request.params.id;


    function dateFormat(dateInfo) {
        var date = new Date(dateInfo);
        return date.toLocaleString();
    }

    Photo.find({user_id: id}, function (err, data) {

        if (err || data === null) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        //console.log(data);
        var photos = JSON.parse(JSON.stringify(data));
        var photoList = [];
        var fetchUser = [];

        function callback(error) {
            if (error) {
                response.status(500).send(error.message);
            }
        }

        async.each(photos, function (photo) {
            var index = -1;
            index =  photo.visibility.indexOf(request.session.user_id);
            //console.log("photo visibility index " + index);

            if (index !== -1 || photo.visibility.length === 0 || photo.user_id === request.session.user_id) {
                var currentPhoto = {};
                currentPhoto._id = photo._id;
                currentPhoto.user_id = photo.user_id;
                currentPhoto.file_name = photo.file_name;
                //temporarily remove format
                currentPhoto.date_time = dateFormat(photo.date_time);
                currentPhoto.comments = [];
                if (!photo.like) {
                    currentPhoto.like = [];
                } else {
                    currentPhoto.like = photo.like;
                }
                if (!photo.favorites) {
                    currentPhoto.favorites = [];
                } else {
                    currentPhoto.favorites = photo.favorites;
                }

                async.each(photo.comments, function (comment) {
                    var currentComment = {};
                    currentPhoto.comments.push(currentComment);
                    currentComment.comment = comment.comment;
                    //temporarily remove format
                    currentComment.date_time = dateFormat(comment.date_time);
                    currentComment._id = comment._id;

                    fetchUser.push(function(callback1) {
                        User.find({'_id': comment.user_id}, function(err, data) {
                            if (err) {
                                response.status(400).send(JSON.stringify(err));
                            }

                            if (data === null) {
                                console.log('User with _id:' + id + ' not found.');
                                response.status(400).send('Not found');
                                return;
                            }

                            var userObj = JSON.parse(JSON.stringify(data[0]));

                            var userObj1 = {};
                            userObj1._id = userObj._id;
                            userObj1.first_name = userObj.first_name;
                            userObj1.last_name = userObj.last_name;

                            currentComment.user = userObj1;
                            callback1();
                        });
                    });
                }, callback);
                photoList.push(currentPhoto);
            }
        }, function (error) {
            if (error) {
                response.status(500).send(JSON.stringify(error));
            }
        });


        async.parallel(fetchUser, function(){
            response.status(200).send(JSON.stringify(photoList));
        });

    });
    /*

            var photos = cs142models.photoOfUserModel(id);
            if (photos.length === 0) {
                console.log('Photos for user with _id:' + id + ' not found.');
                response.status(400).send('Not found');
                return;
            }
            response.status(200).send(photos);
            */


});

app.post('/admin/login', function(request, response) {

    if(request.session.user_id){
        User.findOne({_id:request.session.user_id},function (err, data) {
            if (err){
                request.status(400).send(JSON.stringify(err));
            }
            response.status(200).send(data);
        });
        return;
    }

    User.findOne({login_name:request.body.login_name}, function(err, data) {
        if (err) {
            console.log('login fail');
            response.status(400).send(JSON.stringify(err));
            return;
        }

        if (data === null) {
            console.log('login fail');
            response.status(400).send('Not a valid account');
            return;
        }

        if (!cs142password.doesPasswordMatch(data.password_digest, data.salt, request.body.password)) {
            response.status(400).send('Wrong password');
            return;
        }

        request.session.user_id = data._id;
        request.session.login_name = request.body.login_name;
        response.status(200).send(JSON.stringify(data));
    });

});

app.post('/admin/logout', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    request.session.destroy(function (err) {
        if (err) {
            console.error('Unable to log out');
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.status(200).end();
    });
});


app.post('/user', function(request, response) {
    var loginName = request.body.login_name;
    var password = request.body.password;

    if (!loginName) {
        response.status(400).send("There should be a login name");
        return;
    }

    User.findOne({login_name: loginName}, function(err, data) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }

        if (data) {
            response.status(400).send('This login name is already used');
            return;
        }

        var password1 = cs142password.makePasswordEntry(password);

        var user = {
            login_name:request.body.login_name,
            password_digest:password1.hash,
            salt:password1.salt,
            first_name:request.body.first_name,
            last_name:request.body.last_name,
            location:request.body.location,
            description:request.body.description,
            occupation:request.body.occupation
        };

        User.create(user, function(err, newUser) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }

            newUser.save(function(err) {
                console.log(err);
            });
            request.session.user_id = newUser._id;
            request.session.login_name = newUser.login_name;

            response.status(200).send(JSON.stringify(newUser));
        });
    });
});


app.post('/commentsOfPhoto/:photo_id', function(request, response) {
    if (!request.session.user_id ) {
        response.status(401).send('No user login');
        return;
    }
    var comment = request.body.comment;
    var photoId = request.params.photo_id;
    var users = request.body.users;

    if (!comment) {
        response.status(400).send('Empty comments');
        return;
    }

    Photo.findOne({_id: photoId}, function (err, data) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }

        if (data === null) {
            response.status(400).send("No photo found");
            return;
        }

        var newComment = {
            comment:comment,
            date_time:new Date(),
            user_id: request.session.user_id,
            mentions: users
        };

        data.comments = data.comments.concat([newComment]);
        data.save(function (err) {
            console.log(err);
        });
        console.log("comments: " + data.comments);
        response.status(200).send(JSON.stringify(data));

        });

});


app.post('/photos/new', function(request, response) {
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).send('No user login');
        return;
    }

    var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        if(request.file.fieldname !== "uploadedphoto") {
            response.status(400).send("Wrong field name");
            return;
        }

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            // XXX - Once you have the file written into your images directory under the name
            // filename you can create the Photo object in the database

            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }

            var photoToUpload = {
                user_id: request.session.user_id,
                file_name: filename,
                data_time: new Date(),
                comments: []
            };

            Photo.create(photoToUpload, function(err, newPhoto) {
                if (err) {
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                newPhoto.save(function(err) {
                    console.log(err);
                });
                response.status(200).send(JSON.stringify(newPhoto));
            });

        });
    });

});


app.post('/likePhoto/:photoId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var photoId = request.params.photoId;

    Photo.findOne({_id: photoId}, function (err, data) {
        if (data === null) {
            response.status(400).send("No Photo found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }


        //var index = data.like.indexOf(request.session.user_id);
        //console.log("the index is " + index);

        var index = -1;
        for (var i = 0; i < data.like.length; i++) {
            if (data.like[i].equals(request.session.user_id)) {
                index = i;
            }
        }

        if(index === -1){
           data.like = data.like.concat(request.session.user_id);
           data.save(function (err) {
                console.log(err);
            });
        } else{
            data.like.splice(index, 1);
            data.save(function (err) {
                console.log(err);
            });
        }

        console.log("data like: " + data.like);

        response.status(200).send(JSON.stringify(data));



    });


});



app.post('/deleteComment/:photoId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var photoId = request.params.photoId;
    var commentId = request.body.comment._id;

    //console.log("current comment id " + request.body.comment._id);
    //console.log("photo id " + request.params.photoId);

    Photo.findOne({_id: photoId}, function (err, data) {
        if (data === null) {
            response.status(400).send("No Photo found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }

        //console.log("data.comments " + data.comments);

        var updateComments = [];
        var updateMentions = [];

        async.each(data.comments, function(everyComment){
            if (!everyComment._id.equals(commentId)) {
                updateComments.push(everyComment);
            } else {
                async.each(data.mentions, function(mention1) {
                    var duplicate = false;
                    async.each(everyComment.mentions, function(mention2) {
                        if (mention1.equals(mention2)) {
                            duplicate = true;
                        }
                    });
                    if (duplicate === false) {
                        updateMentions.push(mention1);
                    }

                });
            }

        });

        //console.log("updateComment " + updateComments);
       // console.log("updateMentions " + updateMentions);
        data.comments = updateComments;
        data.mentions = updateMentions;
        data.save();
        response.status(200).send(JSON.stringify(data));

    });

});

app.post('/deletePhoto/:photoId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var photoId = request.params.photoId;

    //console.log("current comment id " + request.body.comment._id);
    //console.log("photo id " + request.params.photoId);

    Photo.findOneAndRemove({_id: photoId}, function (err, data) {
        if (data === null) {
            response.status(400).send("No Photo found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }

       // console.log("data" + data);

        response.status(200).end();
    });

});


app.post('/deleteUser/', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var userId = request.body.userId;

   // console.log("user id " + userId);

    Photo.remove({user_id:userId}, function(err, data) {
        if (data === null) {
            response.status(400).send("No User found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }
    });

    Photo.find({}, function(err, data) {
        if (data === null) {
            response.status(400).send("No Photo found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }

        async.each(data, function(everyPhoto) {
            var updateComments = [];
            async.each(everyPhoto.comments, function(everyComment) {

                if (!everyComment.user_id.equals(userId)) {
                    updateComments.push(everyComment);
                }

                //console.log("everyComment" + everyComment);
            });
           everyPhoto.comments = updateComments;
            everyPhoto.save();
        });
    });


    User.findOneAndRemove({_id: userId}, function (err, data) {
        if (data === null) {
            response.status(400).send("No User found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }

        //console.log("data" + data);
    });

    request.session.destroy(function (err) {
        if (err) {
            console.error('Unable to log out');
            response.status(400).send(JSON.stringify(err));
            return;
        }
    });

    response.status(200).end();
});

app.post('/mention/:photoId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var userId = request.session.user_id;
    var photoId = request.params.photoId;

    //var usersMentioned = request.body.users;

    var userMentionedId = request.body.user_id;

/*
    console.log("userId " + userId);
    console.log("photoId " + photoId);
    console.log("mentionedUser " + userMentionedId);
    */

    /*
        var mention = {};
        mention.user_id = userId;
        mention.mentioned_user_id = userMentionedId;
        mention.photo_id = photoId;
        //var dataSave = [];
*/
        Photo.findOne({_id: photoId}, function (err, data) {
            if (data === null) {
                response.status(400).send("No Photo found");
            }

            if (err) {
                response.status(400).send(JSON.stringify(err));
            }


            var index = -1;

            index = data.mentions.indexOf(userMentionedId);

           // console.log("index " + index);

            if (index === -1) {
                // data.mentions.push(userMentionedId);
                data.mentions = data.mentions.concat([userMentionedId]);
            }

        /*

            async.each(data.mentions, function(everyMention) {
                if (!everyMention.equals(userMentionedId)) {
                    updateMentions.push(everyMention);
                }
                //console.log("everyComment" + everyComment);
            });

            data.mentions = updateMentions;
            */

        var mentionPromise = data.save(function(err) {
                console.log(err);
        });

        mentionPromise.then(function() {
           // console.log(data.mentions);
            response.status(200).send();
        });



    });


});

app.get('/getMention/:userId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var userId = request.params.userId;
    console.log("userId " + userId);

    var photosForUser = [];
    Photo.find({}, function (err, data) {
        if (data === null) {
            response.status(400).send("No Photo found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }


        async.each(data, function(everyPhoto) {
            if (everyPhoto.visibility.indexOf(userId) !== -1 || everyPhoto.visibility.length === 0) {
                async.each(everyPhoto.mentions, function(everyMention) {
                    var mentionInfo = {};
                    var userPhotoBy = {};
                    var userMentionedBy = {};
                    console.log(everyPhoto.file_name + " mentions: " + everyMention);
                    if (everyMention.equals(userId)) {
                        /*
                        User.findOne({_id:everyPhoto.user_id}, function(err, data1){
                            if (data1 === null) {
                                response.status(400).send("No Photo found");
                            }

                            if (err) {
                                response.status(400).send(JSON.stringify(err));
                            }

                            //console.log("data1 " + data1);

                            mentionInfo.photoById = data1._id;
                            mentionInfo.photoByLastName = data1.last_name;
                            mentionInfo.photoByFirstName = data1.first_name;
                            console.log("photoById " + mentionInfo.photoById);

                            userPhotoBy = {
                                _id: data1._id,
                                last_name:data1.last_name,
                                first_name:data1.first_name
                            };


                        });
                        */
                        mentionInfo.photo_id = everyPhoto._id;
                        mentionInfo.file_name = everyPhoto.file_name;
                        mentionInfo.photo_by = everyPhoto.user_id;

                        photosForUser.push(mentionInfo);

                    }
                });
            }


        });
        console.log("photosMentionedUser" + photosForUser);
        response.status(200).send(JSON.stringify(photosForUser));
    });



});

app.post('/favoritePhoto/:photoId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var photoId = request.params.photoId;
    var userId = request.session.user_id;

    //console.log("user id: " + userId);
    //console.log("photo id: " + photoId);

    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }


    Photo.findOne({_id: photoId}, function (err, data) {
        if (data === null) {
            response.status(400).send("No Photo found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }


        //var index = data.like.indexOf(request.session.user_id);
        //console.log("the index is " + index);

        var index = -1;

        index = data.favorites.indexOf(userId);

        if(index === -1){
            data.favorites = data.favorites.concat(userId);
            data.save(function (err) {
                console.log(err);
            });
        } else{
            data.favorites.splice(index, 1);
            data.save(function (err) {
                console.log(err);
            });
        }


        //console.log("data favorites: " + data.favorites);

       response.status(200).send(JSON.stringify(data));



    });

});


app.get('/getFavorite/:userId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    function dateFormat(dateInfo) {
        var date = new Date(dateInfo);
        return date.toLocaleString();
    }

    var userId = request.params.userId;
    //console.log("userId " + userId);

    var photosForUser = [];
    Photo.find({}, function (err, data) {
        if (data === null) {
            response.status(400).send("No Photo found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }

        async.each(data, function(everyPhoto) {
            async.each(everyPhoto.favorites, function(everyFavorite) {
                var photoInfo = {};
                if (everyFavorite.equals(userId)) {
                    photoInfo.photo_id = everyPhoto._id;
                    photoInfo.file_name = everyPhoto.file_name;
                    photoInfo.photo_by = everyPhoto.user_id;
                    photoInfo.date_time = dateFormat(everyPhoto.date_time);

                    photosForUser.push(photoInfo);

                }
            });

        });
        console.log(photosForUser);
        response.status(200).send(JSON.stringify(photosForUser));
    });



});

app.post('/addPhotoPermission/:photoId', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send('No user login');
        return;
    }

    var userId = request.body.user_id;

    var photoId = request.params.photoId;
   // console.log("photoId: " + photoId);
   // console.log("userId " + userId);

    Photo.findOne({_id: photoId}, function (err, data) {
        if (data === null) {
            response.status(400).send("No Photo found");
        }

        if (err) {
            response.status(400).send(JSON.stringify(err));
        }

        var index = -1;

        index = data.visibility.indexOf(userId);

        // console.log("index " + index);

        if (index === -1) {
            // data.mentions.push(userMentionedId);
            data.visibility = data.visibility.concat([userId]);
        }

        var visibilityPromise = data.save(function(err) {
            console.log(err);
        });

        visibilityPromise.then(function() {
            console.log("data visibility: " + data.visibility);
            response.status(200).send();
        });



    });

});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
