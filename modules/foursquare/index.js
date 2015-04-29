var client_id, client_secret;
var request = require('request');
var querystring = require('querystring');
var date = 20141110;


module.exports = function(clientId, clientSecret)
{
    client_id = clientId;
    client_secret = clientSecret;

    return {
        exploreVenue: function(data, callback) {
            var urlString;
            urlString = "https://api.foursquare.com/v2/venues/explore?" + querystring.stringify(data) + '&client_id=' +
                        client_id + '&client_secret=' + client_secret + '&v=' + date;
            return request(urlString, function (error, response, body) {
                return handleResp(response, body, callback);
            });
        },
        venueCategories: function(callback) {
            var urlString;

            urlString = "https://api.foursquare.com/v2/venues/categories?client_id=" +
                        client_id + "&client_secret=" + client_secret + "&v=" + date;

            return request(urlString, function (error, response, body) {
                if (response.statusCode >= 300) {
                    return callback(body, null);
                }
                else {
                    var cats = JSON.parse(body);
                    var categories = cats.response.categories;

                    var categoriesResult = [];
                    for (var i = 0; i < categories.length; i++) {
                        categoriesResult.push({
                                "id" : categories[i].id,
                                "name" : categories[i].name,
                                "icon" : categories[i].icon
                            }
                        );
                    }
                    return callback(null, categoriesResult);
                }
            });
        }
    };

};

var handleResp = function(res, body, callback) {
    if (res.statusCode >= 300) {
        return callback(body, null);
    } else {
        return callback(null, JSON.parse(body));
    }
};