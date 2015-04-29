module.exports = function(config, express, app, root)
{
    var foursquare  = require('../foursquare')(config.foursquare.client_id, config.foursquare.client_secret),
        main = require('../main'),
        distance = require('../distance'),
        ordering = require('../ordering'),
        mongo = require('../mongo'),
        body_parser = require('body-parser');

    //needed to parse POST variables (in JSON format --> POST = {"var1":"val1", "var2":"val2"})
    app.use(body_parser.json());

    //load index.html as a default
    app.get('/', function(req, res) {
        res.sendFile('client/views/index.html', {'root' : root});
    });

    app.get('/mongoTest', function(req, res) {
        res.sendFile('client/views/mongo.html', {'root' : root});
    });

    app.get('/getVeneuesCategories', function(req, res) {
        foursquare.venueCategories(function(error, response) {
            if(!error){
                res.send(response);
            } else {
                res.send("ERROR "+error);
            }
        })
    });

    app.post('/requestMongoDb', function(req, res){
        var params = {
            "command": req.body.command
        };

        console.log("the params "+JSON.stringify(params));
        mongo.requestMongo(params, function(error, response){
            if(!error)
                res.send(response);
            else
                res.send("ERROR "+error);
        })
    });

    app.post('/getMoreSightOptions', function(req, res) {
        console.log("routeId: " + req.body.routeId);
        console.log("previousSight: " + JSON.stringify(req.body.previousSight));

        var params = {routeId: req.body.routeId, previousSight: req.body.previousSight };

        mongo.getSightOptions(params, function(error, response) {
            if(!error){
                res.send(response);
            } else {
                res.send("ERROR " + error);
            }
        })
    });

    app.post('/fsexplore', function(req, res){

        var params = {
            "ll": req.body.ll,
            "radius": req.body.radius
        };

        console.log("the params "+JSON.stringify(params));
        foursquare.exploreVenue(params, function(error, venues){
            if(!error)
                res.send(venues);
            else
                res.send("ERROR "+error);
        })
    });

    app.post('/doCalculations', function(req, res){
        distance.getCalculations(req, function(error, response){
            if(!error)
                res.send(response);
            else
                res.send("ERROR " + error);
        })
    });

    app.post('/doOrdering', function(req, res){
        ordering.getOrderedList(req, function(error, response){
            if(!error)
                res.send(response);
            else
                res.send("ERROR " + error);
        })
    });

    app.post('/doMain', function(req, res) {
        main.mainCall(req, function(error, response) {
            if (!error) {
                res.send(response);
            }
            else {
                res.status(400).send(error);
            }
        })
    });

    //link route to script/asset folders:
    app.use('/lib', express.static(root + '/bower_components/'));
    app.use('/js', express.static(root + '/client/js/'));
    app.use('/css', express.static(root + '/client/css/'));
    app.use('/views', express.static(root + '/client/views/'));
    app.use('/img', express.static(root + '/client/img/'));
}