var mongoose = require('mongoose'),
    Grid = require('gridfs-stream'),
    mime = require('mime'),
    fs = require('fs');

Grid.mongo = mongoose.mongo;

var chunkSize = 8 * 1024 * 1024; // 10 megs
var collection = 'episodes';


exports.save = function(path, filename, callback) {
    var conn = mongoose.connection;
    var gfs = Grid(conn.db);
    var options = {
        root: collection,
        filename: filename,
        contentType: mime.lookup(path),
        chunkSize: chunkSize,
        metadata: {contentType: mime.lookup(path)} // setting in the root is not working
    };
    var writestream = gfs.createWriteStream(options);
    fs.createReadStream(path).pipe(writestream);
    writestream.on('error', function(error) {
        callback(new Error('An error occured when saving the file to GridFS'), null);
    })
    writestream.on('close', function(file) {
        console.log('File saved in GridFS with the following metadata');
        console.log(file);
        callback(null, file);
    })
};


exports.metadata = function(filename, callback) {
    var conn = mongoose.connection;
    var gfs = Grid(conn.db);
    var options = {
        root: collection,
        filename: filename
    };
    gfs.collection(collection).find({filename:filename}).toArray(function (err, files) {
        if (err) {
            callback(err, null);
            return;
        }
        if (files && files.length > 0) {
            callback(null, files[0]);
        } else {
            callback(null, null);
        }
    });
};


exports.load = function(filename, callback) {
    var conn = mongoose.connection;
    var gfs = Grid(conn.db);
    gfs.collection(collection).find({filename:filename}).toArray(function (err, files) {
        if (err) {
            callback(new Error('An error occurred when retrieving video from MongoDB'));
        }
        if (files && files.length > 0) {
            var metadata = files[0];
            var options = {
                filename: filename,
                root: collection
            };
            var readstream = gfs.createReadStream(options);
            callback(null, metadata, readstream);
        } else {
            callback(null, null, null);
        }
    });
};
