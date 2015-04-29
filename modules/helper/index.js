module.exports = {

    options: function() {
        return {
            segments: 3, // option to set the amount of segments from A to B
            decimals: 3
        }
    },

    latitudeLongitudeFactors: function() { // Europe
        return {
            lat : 111.0,
            long : 75.0
        }
    },

    getFrom: function(data) {
        var from = {
            lat : data.body.latFrom,
            long : data.body.longFrom
        }

        return from;
    },

    getTo: function(data) {
        var to = {
            lat : data.body.latTo,
            long : data.body.longTo
        }

        return to;
    },

    getArrivalTime: function(data) {
        var currentTime = new Date();

        try {
            currentTime = new Date(data.body.timeTo);
        }
        catch (e) {
            // do nothing
        }

        var timeTo = {
            timeTo : currentTime
        }

        return timeTo;
    },

    getCategories: function(data) {
        var categories = {
            userCategories : data.body.userCategories
        }

        return categories;
    },

    startEqualsEndpoint: function(from, to) {
        var delta = 0.000000001;
        var a = Math.abs(from.long - to.long);
        var b = Math.abs(from.lat - to.lat);

        if (a < delta && b < delta) {
            return true;
        }

        return false;
    },

    relativeDistance: function(from, to) {
        var a = Math.abs(from.lat  - to.lat);
        var b = Math.abs(from.long - to.long);

        return (Math.pow(a, 2) + Math.pow(b, 2)) * 1000000; // TODO: remove 1mio after debugging
    },

    toRadians: function(degrees) {
        return degrees * Math.PI / 180;
    },

    toDegrees: function(radians) {
        return radians * 180 / Math.PI;
    },

    ceil: function(double, decimals) {
        var d = Math.pow(10, decimals);
        return Math.round(double * d) / d;
    }
};