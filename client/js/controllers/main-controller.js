app.value(
    'coords', {
        'target' :  {
            'lng' : 0.0,
            'lat' : 0.0
        },
        'origin' : {
            'lng' : 0.0,
            'lat' : 0.0
        },
        'routeId' : ""
    }).
    value('categories',
        {
            'available' : [],
            'selected' : []
        }).
    value('map', { center: { latitude: 45, longitude: -73 }, zoom: 8 }).
    value('timeConstraint', {
        'isSelected' : false,
        'time' : new Date()
    }).
    value('venues', {}).
    value('stepsArray', []).
    controller('MainCtrl', ['map', 'categories', 'timeConstraint', '$location', 'stepsArray', '$scope', '$http', 'coords', 'venues', 'fsCategoriesService',
    function(map, categories, timeConstraint, $location, stepsArray, $scope, $http, coords, venues, fsCategoriesService) {

        $scope.searchInputBox = "searchInputPlaceholder";
        $scope.timeConstraint = undefined;

        /* timing  vars start */
        var curTime = new Date();
        //set date to 01.01.1970 to make comparable to entered time constraints
        curTime.setFullYear(1970);
        curTime.setMonth(0);
        curTime.setDate(1);
        //this variable is set to true, if the timeconstraint time is set for tomorrow (user entered a time in the past for the current day)
        $scope.showTomorrow = false;

        $scope.changeTimeConstraint = function()
        {
            if($scope.timeConstraint <= curTime)
                $scope.showTomorrow = true;
            else
                $scope.showTomorrow = false;
        }

        /* timing vars end */

        $scope.fsCategories = categories.available;
        $scope.userCategories = categories.selected;

        /*
         * ----------------------------- replace references to userCategories -------------------------
         * replace selected categories by reference, otherwise it doesn't show previously chosen categories
         */

        var replaceByReference = function(idx, id)
        {
            angular.forEach($scope.fsCategories, function(value, key){
                if(value.id == id)
                    $scope.userCategories[idx] = $scope.fsCategories[key];
            });
        }

        if($scope.userCategories.length != 0)
        {
            angular.forEach($scope.userCategories, function(value, key){
                replaceByReference(key, value.id);
            });
        }

        /* reference for the time */
        if(timeConstraint.isSelected)
        {
            $scope.timeConstraint = timeConstraint.time;
        }

        /*
        * ------------------------------------------------------------------------------------------------
         */

        $scope.map = map;


        //send button is only shown, if both locations (origin and destination) are available
        $scope.error = {
            origMissing: true,
            dstMissing: true
        };

        //only fetch categories, if they're not already loaded
        if($scope.fsCategories.length === 0) {
            console.log('Im goin in!!');
            fsCategoriesService.getAll().then(
                function (data) {
                    $scope.fsCategories = data;
                }
            );
        }

        $scope.doMain = function () {

            if ($scope.timeConstraint != undefined) {
                timeConstraint.isSelected = true;
                timeConstraint.time = angular.copy($scope.timeConstraint);
            }

            categories.available = angular.copy($scope.fsCategories);
            categories.selected = angular.copy($scope.userCategories);

            selectedCategories = "";

            angular.forEach(categories.selected,
              function (categorie, key) {
                selectedCategories += categorie.name.trim() + ",";
              });

          selectedCategories = selectedCategories.substr(0, selectedCategories.lastIndexOf(","));


            if (!($scope.error.origMissing || $scope.error.dstMissing)) {
                $http.post('/doMain',
                    {
                        latFrom: coords.origin.lat,
                        longFrom: coords.origin.lng,
                        latTo: coords.target.lat,
                        longTo: coords.target.lng,
                        userCategories: selectedCategories,
                        timeTo: timeConstraint.time
                    })
                    .success(function (data, status, headers, config) {
                        coords.routeId = data.routeId;
                        //clear steps array

                        angular.copy([], stepsArray);
                        angular.copy(data, venues);

                        //go to plan, where the user can define
                        $location.path('plan');
                    })
                    .error(function (error, status, headers, config) {
                        console.log("error...");
                        alert("An Error occured: " + JSON.stringify(error));
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }
        };


        var events = {
            places_changed: function (searchBox) {
                //console.log(searchBox.getPlaces()[0].geometry.location.lat());
                //console.log(searchBox.getPlaces()[0].geometry.location.lng());
                coords.target.lng = searchBox.getPlaces()[0].geometry.location.lng();
                coords.target.lat = searchBox.getPlaces()[0].geometry.location.lat();
                $scope.error.dstMissing = false;
            }
        };
        $scope.searchbox = {template: 'searchbox.tpl.html', events: events, parentdiv: 'searchInputBox'};


        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {

                coords.origin.lat = position.coords.latitude;
                coords.origin.lng = position.coords.longitude;
                $scope.map = {center: {latitude: coords.origin.lat, longitude: coords.origin.lng}, zoom: 14}
                $scope.error.origMissing = false;

            }, function () {
                handleNoGeolocation(true);
            });
        }
    }]);