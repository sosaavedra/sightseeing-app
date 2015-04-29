module.exports = {

    var: mongojs = require('mongojs'),
    var: db = mongojs('detourist:detouristMongo@54.69.203.156:33000/db', ['fs']),
    var: dbr = mongojs('detourist:detouristMongo@54.69.203.156:33000/db', ['routes']),
    var: dbs = mongojs('detourist:detouristMongo@54.69.203.156:33000/db', ['sights']),

    requestMongo2: function(params, callback) {

        var data = params.command;
        var returned = false;

        db.fs.remove({created:data}, function(err, docs) {
            if (err == null) {
                return callback(null, "Everything fine, deleted \"" + JSON.stringify(docs) + "\""); // {"n":<numberOfLines>} (0 when no entry found)
            }
            else if (err != null) {
                return callback("Ooops, Error occured!"); // only entered when exception occured, NOT when number of result equals 0
            }
        });
    },

    requestMongo: function(params, callback) {

        var data = params.command;
        var returned = false;

        db.fs.save({created:data}, function() {
            db.fs.find({created:data}, function(err, docs) {

                if (!returned && docs != null) {
                    returned = true;
                    return callback(null, "Hellooooo: " + JSON.stringify(docs));
                }
            });
        });
    },

    saveRoute: function (params, callback) {
        dbr.routes.save({
            from: {
                type: "Point",
                coordinates: [params.from.lat, params.from.long]
            },
            to: {
                type: "Point",
                coordinates: [params.to.lat, params.to.long]
            },
            sights: params.sights
        }, function(err, docs){
            if(docs != null) {
                dbr.routes.ensureIndex({from: "2dsphere"});
                dbr.routes.ensureIndex({to: "2dsphere"});

                return callback(null, docs._id);
            } else {
                return callback(err, null);
            }
        });
    },

    saveSights: function (params, callback) {
        var routeId = params.routeId;
        var sights = params.sights;

        for(var i = 0; i < sights.length; i++){
            var sight = {
                routeId: routeId,
                sight: sights[i],
                location: {
                    type: "Point",
                    coordinates: [sights[i].venue.location.lat, sights[i].venue.location.lng]
                }
            };

            dbs.sights.save(sight);
        }

        dbs.sights.ensureIndex({location: "2dsphere", routeId: 1});

        return callback(null);
    },

    getSightOptions: function(params, callback) {
        var routeId = params.routeId;
        var previousSight = params.previousSight;

        var command = {
            geoNear: "sights",
            near: {
                type: "Point",
                coordinates: [parseFloat(previousSight.lat), parseFloat(previousSight.long)]
            },
            spherical: true,
            limit: 5,
            minDistance: 1,
            maxDistance: 2000,
            query: {routeId: mongojs.ObjectId(routeId)}
        };

        console.log("command: " + JSON.stringify(command));
        dbs.runCommand(command, function(err, docs){
            if(docs != null){
                return callback(null, docs);
            } else {
                return callback(err, null);
            }
        });
    }
};