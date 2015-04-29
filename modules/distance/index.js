module.exports = {

    var: helper = require('../helper'),

    calculateStops: function(from, to, radius, distance) {
        var numPoints = (radius["km"] > 1 ?  Math.ceil(distance["km"] / radius["km"]) : Math.ceil(distance["m"] / radius["m"])) - 1;
        var stops = new Array(numPoints);
        var latLongFactor = helper.latitudeLongitudeFactors();

        // verhaeltnis
        var a = distance.data.a;
        var b = distance.data.b;
        var meters = radius["m"];
        var a_b_pow2 = Math.pow(a / b, 2);

        for (var i = 0; i < stops.length; i++) {
            var meters_pow2 = Math.pow((i + 1) * meters, 2);
            var y = Math.sqrt(meters_pow2 / (a_b_pow2 + 1)); // meters
            var x = Math.sqrt(meters_pow2 - Math.pow(y, 2)); // meters

            // calculate offset
            var xOffset = (x / 1000 / latLongFactor.lat);
            var yOffset = (y / 1000 / latLongFactor.long);

            // insert right direction
            var obj = new Object();
            if (from.lat <= to.lat) {
                obj["latitude"] = 1 * from.lat + xOffset;
            }
            else {
                obj["latitude"] = 1 * from.lat - xOffset;
            }

            if (from.long <= to.long) {
                obj["longitude"] = 1 * from.long + yOffset;
            }
            else {
                obj["longitude"] = 1 * from.long - yOffset;
            }

            stops[i] = obj;
        }

        console.log(JSON.stringify(stops));
        return stops;

        // see calculations below if you are interested :)
        // Given:
        //  (1) x/y = a/b
        //      <=> x = (a/b) * y
        //      => relAtoB := (a/b)
        //      => x = relAtoB * y
        //  (2) x² + y² = meters²
        //      (1) -> (2)
        //      => (relAtoB * y)² + y² = meters²
        //      <=> relAtoB² * y² + y² = meters²
        //      <=> y² (relAtoB² + 1) = meters²
        // ##   <=> y² = meters² / (relAtoB² + 1)
        //  (3) Use x² + y² = meters² to get x
        // ##   => x = sqrt(meters² - y²)
    },

    calculateDistance: function(from, to) {
        /* init */
        var jsonResponse = '{"m":<distanceMeters>,"km":<distanceKiloMeters>,"data":{"a":<a>,"b":<b>}}';
        var latLongFactor = helper.latitudeLongitudeFactors();

        /* calculation */
        var a = Math.abs(from.lat  - to.lat)  * latLongFactor.lat;
        var b = Math.abs(from.long - to.long) * latLongFactor.long;
        var kilometers = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
        var meters =  kilometers * 1000;

        /* json adjustment */
        jsonResponse = jsonResponse.replace("<distanceMeters>", helper.ceil(meters, helper.options().decimals));
        jsonResponse = jsonResponse.replace("<distanceKiloMeters>", helper.ceil(kilometers, helper.options().decimals));
        jsonResponse = jsonResponse.replace("<a>", a);
        jsonResponse = jsonResponse.replace("<b>", b);

        /* return */
        return JSON.parse(jsonResponse);
    },

    getCustomRadius: function(distance) {
        var copy = JSON.parse(JSON.stringify(distance));

        for (var key in copy) {
            copy[key] = helper.ceil(copy[key] / helper.options().segments, helper.options().decimals);
        }

        return copy;
    }

};