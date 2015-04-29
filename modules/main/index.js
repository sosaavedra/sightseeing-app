module.exports = {

    var: helper = require('../helper'),
    var: distance = require('../distance'),
    var: ordering = require('../ordering'),
    var: foursquare = require('../4square'),
    var: mongo = require('../mongo'),

    setSightCount: function(time) {
        // inital sight count (top5)
        var initial = 5;

        // store current hour
        var currentdate = new Date();
        var currentHours = currentdate.getHours();

        // set arrival hour, if set
        var arrivalHours = currentHours;
        try {
            arrivalHours = time.timeTo.getHours();
        }
        catch (e) {
            // do nothing
        }

        // calculate difference and divide by 1,1 (approx. stay per sight)
        // and reset initial when result is greater 5
        var calculated;
        if (arrivalHours < currentHours) { // arrivalHours represents next day
            calculated = (24 - currentHours + arrivalHours) / 1.1;
        }
        else { // "normal" calculation
            calculated = (arrivalHours - currentHours) / 1.1;
        }

        if (calculated > initial) {
            initial = Math.ceil(calculated);
        }

        return initial;
    },

    /* main call */
    mainCall: function(data, callback) {
        var from = helper.getFrom(data);
        var to = helper.getTo(data);
        var categories = helper.getCategories(data);
        var arrivalTime = helper.getArrivalTime(data);

        if (helper.startEqualsEndpoint(from, to)) {
            return callback("Startpoint equals Endpoint. Please use different coordinates!", null);
        }

        var d = distance.calculateDistance(from, to);
        var r = distance.getCustomRadius(d);
        var stops = distance.calculateStops(from, to, r, d);
        var sightCount = this.setSightCount(arrivalTime);


        foursquare.getItems(stops, r, categories, function(error, response) {
            if (error == null) {
                var fsItems = JSON.parse(JSON.stringify(response));
                //var filteredByCategories = ordering.filterByCategories(response, categories);
                var top5 = ordering.chooseTop5(sightCount, response);
                var result = ordering.getOrderedList(from, to, top5);
                console.log("Result: " + JSON.stringify(result));
                var saveRouteParams = {
                    from: from,
                    to: to,
                    sights: result
                };

                mongo.saveRoute(saveRouteParams, function(error, routeId){

                    if(error == null){
                        console.log("Routed id: " + routeId)

                        var saveSightsParams = {
                            routeId: routeId,
                            sights: fsItems
                        };

                        mongo.saveSights(saveSightsParams, function(error){
                            if(error == null){
                                result.routeId = routeId;
                                return callback(null, result);
                            } else {
                                return callback(error, null);
                            }
                        });
                    } else {
                        return callback(error, null);
                    }
                });
            }
            else {
                return callback(error, null);
            }
        });
    }
};