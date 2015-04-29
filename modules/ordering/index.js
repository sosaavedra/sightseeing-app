module.exports = {

    var: helper = require('../helper'),

    getOrderedList: function(from, to, top10) {
        for (var i = 0; i < top10.length; i++) {
            var distance = helper.relativeDistance(to, {
                lat: top10[i].venue.location.lat,
                long: top10[i].venue.location.lng
            });
            top10[i].distanceToB = distance;
            console.log(helper.ceil(distance, 3) + " is the distance from \"" + top10[i].venue.name + "\" to \"endpoint\"");
        }

        function sortOrder(a, b) {
            return b.distanceToB - a.distanceToB;
        }
        top10 = top10.sort(sortOrder);

        // debug output
        console.log(" ");
        for (var i = 0; i < top10.length; i++) {
            console.log((i + 1) + ". sight: " + top10[i].venue.name + " \t\tdistance: " + helper.ceil(top10[i].distanceToB, 0));
        }

        var result = {
            start : from,
            stop : to,
            sights : top10
        };
        return result;
    },

    filterByCategories: function(items, categories) {
        if (categories.userCategories.length == 0) {
            return items;
        }

        // claim categories
        var toCheck = [];
        for (var i = 0; i < categories.userCategories.length; i++) {
            // https://ss3.4sqi.net/img/categories_v2/arts_entertainment/default_
            var currentCategory = categories.userCategories[i];
            var folderName = currentCategory.icon.prefix.split("categories_v2/")[1].split("/")[0];
            toCheck.push(folderName);
        }

        // filter
        // highly efficient algorithm O(n³), don't touch or you will be lost :D
        // sorry guys, its 2:40am, if you have a better solution, go ahead
        var filteredItems = [];
        var found = false;
        for (var i = 0; i < items.length; i++) {
            var currentCategories = items[i].venue.categories;
            for (var j = 0; j < toCheck.length; j++) {
                for (var h = 0; h < currentCategories.length; h++) { // in most cases only one element
                    if (currentCategories[h].icon.prefix.indexOf(toCheck[j]) > -1) {
                        found = true;
                    }
                    if (found) break;
                }
                if (found) break;
            }
            if (found) {
                filteredItems.push(items[i]);
                found = false; // reset for next iteration, otw *boooooom*
            }
        }

        return filteredItems;
    },

    chooseTop5: function(sightCount, items) {
        var count = sightCount;
        if (items.length <= count) { // no need for selection
            return items;
        }

        function sortOrder(a, b) {
            if (b == null) {
                return 99999
            }
            if (a == null) {
                return -99999;
            }
            return b.venue.rating - a.venue.rating;
        }
        items = items.sort(sortOrder);

        var top10 = new Array(count);
        for (var i = 0; i < count; i++) {
            top10[i] = items[i];
        }

        return top10;
    }

};