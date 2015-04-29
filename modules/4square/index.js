module.exports = {

    var: request = require('request'),
    var: querystring = require('querystring'),


    getItems: function(stops, radius, categories, callback) {
        var radius = radius.m; // meters
        var result = null;
        var exception = null;
        var callbackCounter = 0;

        for (var i = 0; i < stops.length; i++) {
            this_ = this;
            this.requestItems(stops[i].latitude, stops[i].longitude, radius, categories, function(error, response) {
                if (result == null) {
                    result = response;
                }
                else {
                    result = this_.merge(result, response);
                }

                if (error != null) {
                    exception = error;
                }

                // return
                callbackCounter++;
                if (callbackCounter == stops.length) {
                    if (exception == null) {
                        return callback (null, result);
                    }
                    else {
                        return callback (exception, null);
                    }
                }
            });
        }
    },

    merge: function(result, add) {
        Array.prototype.unique = function() {
            var a = this.concat();
            for(var i=0; i<a.length; ++i) {
                for(var j=i+1; j<a.length; ++j) {
                    if(a[i].venue.id === a[j].venue.id)
                        a.splice(j--, 1);
                }
            }

            return a;
        };

        if (add == null) {
            return result;
        }

        result = result.concat(add).unique();

        return result;
    },

    requestItems: function(lat, long, radius, categories, callback) {
        var settings = {
            ll: lat + ',' + long,
            radius: radius,
            query: categories.userCategories,
            client_id : "LBOESLESVFSSMCVUSTWTD1UEO2D0X0ER1R1DY3K5TRLTL3QY",
            client_secret : "23OY4QUL5MR2LPBAYF1SFHLCNN2G3SV4CG0JTNX52BVCR3B5",
            v : 20141110
        };

        var urlString = "https://api.foursquare.com/v2/venues/explore?" + querystring.stringify(settings);
        console.log("urlString: " + urlString);

        request.get(urlString, {}, function (error, response, body) {
            var responseBody = JSON.parse(response.body);
            if (error == null && response.statusCode == 200 && responseBody.meta.code == 200) {
                obj = JSON.parse(body);
                obj = obj.response.groups[0].items;
                return callback(null, obj);
            }
            else {
                if (error != null) {
                    console.log("Error occured: " + error);
                    return callback(error, null);
                }
                else {
                    console.log("Error occured with FS request: " + JSON.stringify(responseBody.meta));
                    return callback(responseBody.meta, null);
                }
            }
        })
    }

};