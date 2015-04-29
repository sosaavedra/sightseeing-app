app.controller('PlanCtrl', ['$q', '$filter','timeConstraint', 'ModalService', 'sightseeingConfig' ,'$route', '$timeout', '$scope', '$http', 'coords', 'venues', 'dateFilter', 'stepsArray', 'uiGmapIsReady', function($q, $f, timeConstraint, ModalService, config, $route, $timeout, $scope, $http, coords, venues, df, stepsArray, IsReady) {

    $scope.steps = stepsArray;
    var directionsService = new google.maps.DirectionsService();

    /**
     * if a timeConstraint was given, timeConstraint.isSelected will be true and timeConstraint.time will hold the
     * time
     * TODO: @hesham: handle this timeconstraint
     */
    $scope.timeConstraint = timeConstraint;
    if(timeConstraint.isSelected) {
        console.log('Selected arrival time: '+$f('date')(timeConstraint.time, 'HH:mm'));
        console.log(timeConstraint.time);
    }
    else {
        console.log('No time constraints given...');
    }
        


    if (stepsArray.length == 0) {
        console.log('Reading the steps...');
        readStepsArray();
        //add watcher
    }

    function readStepsArray() {
        //read places into steps array

        console.log('read steps array');

        //push our current location:
        stepsArray.push(
            {
                "name": 'Your current location',
                "transport": '-',
                "time": df((new Date()).setHours((new Date()).getHours()), 'HH:mm'),
                "timevalue": df((new Date()).setHours((new Date()).getHours()), 'HHmm'),
                "instructions": 'Your original location',
                "coords": {lat: coords.origin.lat, long: coords.origin.lng},
                "location": function(){
                    return this.coords.lat + ',' + this.coords.long;
                },
                "hide": false,
                "shuffle": 'noShuffle',
                "shuffleProcessing": false,
                "route": {},
                "routeExpanded": false,
                "template": config.emptyRouteTemplate,
                "departure": new Date(),
                "tipHide" : true
            }
        );

        angular.forEach(venues.sights, function (sight, key) {

            this.push(
                {
                    "name": sight.venue.name,
                    "transport": sight.venue.rating,
                    "time": df((new Date()).setHours((new Date()).getHours()), 'HH:mm'),
                    "timevalue": df((new Date()).setHours((new Date()).getHours()), 'HHmm'),
                    "instructions": (angular.isArray(sight.tips)) ? sight.tips[0].text : 'no recommendations available',
                    "coords": {lat: sight.venue.location.lat, long: sight.venue.location.lng},
                    "location": function(){
                        return this.coords.lat + ',' + this.coords.long;
                    },
                    "hide": false,
                    "shuffle": 'noShuffle',
                    "shuffleProcessing": false,
                    "route": {},
                    "routeExpanded": false,
                    "template": config.emptyRouteTemplate,
                    "departure": new Date(),
                    "arrival": new Date(),
                    "tipHide" : true
                }
            );
        }, stepsArray);

        stepsArray.push(
            {
                "name": 'Your Destination Location',
                "transport": '-',
                "time": df((new Date()).setHours((new Date()).getHours()), 'HH:mm'),
                "timevalue": df((new Date()).setHours((new Date()).getHours()), 'HHmm'),
                "instructions": 'Where you wanna go to',
                "coords": {lat: coords.target.lat, long: coords.target.lng},
                "location": function(){
                    return this.coords.lat + ',' + this.coords.long;
                },
                "hide": false,
                "shuffle": 'noShuffle',
                "shuffleProcessing": false,
                "route": {},
                "routeExpanded": false,
                "template": config.emptyRouteTemplate,
                "arrival": new Date(),
                "tipHide" : true
            }
        );

        //calculate the route to the first sight
        var promiseToWaitFor = calcRoute(stepsArray[0].location(), stepsArray[1].location(), new Date());

        //recursive promise chain to provide sequential processing (directions api calls are sequentially dependant)
        recPromiseChain(1, stepsArray.length - 1, promiseToWaitFor);

    }


    function recPromiseChain(index, lastIndex, promiseToWaitFor) {
        promiseToWaitFor.then(function (route) {

            //set route and template only
            stepsArray[index - 1].route = route;
            stepsArray[index - 1].template = config.textualRouteTemplate;

            /*
             When the calculated route doesn't contain any public transport (e.g. just walking)
             google doesn't return a departure_time or arrival_time, so we need to calculate them
             ourselves

             if google doesn't return a departure_time, we just use arrival_time + 1 hour (TODO: make this hour configurable)
             otherwise we take the departure time google suggested, so the users timetable gets
             adjusted to the timetable of public transport

             if the arrival_time is returned by google, we use it as the arrival time at the next sight
             otherwise we calculate the arrival time by the values returned by google as "duration" for a certain route
             in seconds
             */

            if (angular.isDefined(route.routes[0].legs[0].arrival_time)) {
                //set departure time so it fits to the time table of public transport:
                stepsArray[index - 1].departure = route.routes[0].legs[0].departure_time.value;


                //set the calculated arrival time from google

                stepsArray[index].arrival = route.routes[0].legs[0].arrival_time.value;
                stepsArray[index].arrivalString = extractTime(''+stepsArray[index].arrival);


            //    stepsArray[index].arrival = route.routes[0].legs[0].arrival_time.value;

                // console.log(stepsArray[index].arrival);

            }
            else {
                /*
                 calculate arrival time
                 */

                stepsArray[index].arrival = new Date(stepsArray[index - 1].departure.getTime() + (stepsArray[index - 1].route.routes[0].legs[0].duration.value * 1000)); //duration.value contains second values, we need to recalc to milliseconds
                stepsArray[index].arrivalString = extractTime(''+stepsArray[index].arrival);

                //stepsArray[index].arrival = new Date(stepsArray[index - 1].departure.getTime() + (stepsArray[index - 1].route.routes[0].legs[0].duration.value * 1000)); //duration.value contains second values, we need to recalc to milliseconds
                 // console.log(stepsArray[index].arrival);

            }

            //now calculate departure times which lead to the current sight:
            stepsArray[index-1].route.routes[0].legs[0].steps = calculateSubstepTimes(stepsArray[index-1].route.routes[0].legs[0].steps, stepsArray[index-1].departure);


            if (index != lastIndex) {

                //calculate departure time (1 hour after arrival)
                // --> gets changed in next iteration, if google returns departure_time for the route)
                stepsArray[index].departure = new Date(stepsArray[index].arrival.getTime() + 3600 * 1000);

                //calculation of next route:
                var newPromiseToWaitFor = calcRoute(stepsArray[index].location(), stepsArray[index + 1].location(), stepsArray[index].departure);
                recPromiseChain(index + 1, lastIndex, newPromiseToWaitFor);
            }
            else {
                //calculation chain finished:
                console.log('last route calculated');
                console.log(stepsArray);
            }
        });
    }

    $scope.expandRoute = function (index) {
        // return;
        if(index != stepsArray.length-1) {
            for(var i=0; i < stepsArray.length; i++) {
                if(i != index)
                    stepsArray[i].routeExpanded = false;
            }
            stepsArray[index].routeExpanded = !stepsArray[index].routeExpanded;
        }
    };


    $scope.shuffleStep = function (number) {
        if(number != 0 && number != stepsArray.length-1) {


        console.log("shuffle shuffle!" + number);

        stepsArray[number].routeExpanded = false;
        stepsArray[number].shuffle = 'yesShuffle';
        stepsArray[number].shuffleProcessing = true;

        //request new sights:
        /*
         TODO - request /getMoreSightOptions with the following parameters:
         { routeId: coords.routeId, previousSight: sight }
         It's expected that sight contains {lat: <value>, long: <value>, ... }
         */
        var shufflePromise = $http.post('/getMoreSightOptions', {
            routeId: coords.routeId,
            previousSight: stepsArray[number].coords
        }).success(function (data, status, headers, config) {
            // console.log(data.results);
            if(data.results.length > 0) {
                console.log(data.results[0].obj);
                var sight = data.results[0].obj.sight;

                stepsArray[number] = {
                    "name": sight.venue.name,
                    "transport": sight.venue.rating,
                    "time": df((new Date()).setHours((new Date()).getHours()), 'HH:mm'),
                    "timevalue": df((new Date()).setHours((new Date()).getHours()), 'HHmm'),
                    "instructions": (angular.isArray(sight.tips)) ? sight.tips[0].text : 'no recommendations available',
                    "coords": {lat: sight.venue.location.lat, long: sight.venue.location.lng},
                    "location": function(){
                        return this.coords.lat + ',' + this.coords.long;
                    },
                    "hide": false,
                    "shuffle": 'yesShuffle',
                    "shuffleProcessing": true,
                    "route": {},
                    "routeExpanded": false,
                    "template": config.emptyRouteTemplate,
                    "departure": new Date(),
                    "arrival": new Date(),
                    "tipHide" : true
                };

                    //recalculate the route starting from the sight in front of the changed one:
                var promiseToWaitFor = calcRoute(stepsArray[number-1].location(), stepsArray[number].location(), stepsArray[number-1].departure);

                //recursive promise chain to provide sequential processing (directions api calls are sequentially dependant)
                recPromiseChain(number, stepsArray.length - 1, promiseToWaitFor);


                
                //wait for animation to complete (1 second), then delete element from array
                $timeout(function () {
                    stepsArray[number].shuffle = 'noShuffle';
                }, 100);

                $timeout(function () {
                    stepsArray[number].shuffleProcessing = false;
                }, 600);
                


                }
        });

        }

     /*   var modalInstance = ModalService.openModal($scope, shufflePromise, stepsArray[number].name);

        modalInstance.result.then(function(selectedVenue){
            //includes the selected venue to replace the current venue
            //console.log('the new venue is here!')

            var sight = selectedVenue.obj.sight;

            //replace old venue
            stepsArray[number] = {
                "name": sight.venue.name,
                "transport": sight.venue.rating,
                "time": df((new Date()).setHours((new Date()).getHours()), 'HH:mm'),
                "timevalue": df((new Date()).setHours((new Date()).getHours()), 'HHmm'),
                "instructions": (angular.isArray(sight.tips)) ? sight.tips[0].text : 'no recommendations available',
                "coords": {lat: sight.venue.location.lat, long: sight.venue.location.lng},
                "location": function(){
                    return this.coords.lat + ',' + this.coords.long;
                },
                "hide": false,
                "route": {},
                "routeExpanded": false,
                "template": config.emptyRouteTemplate,
                "departure": new Date(),
                "arrival": new Date()
            };

            //recalculate the route starting from the sight in front of the changed one:
            var promiseToWaitFor = calcRoute(stepsArray[number-1].location(), stepsArray[number].location(), stepsArray[number-1].departure);

            //recursive promise chain to provide sequential processing (directions api calls are sequentially dependant)
            recPromiseChain(number, stepsArray.length - 1, promiseToWaitFor);

            console.log('changed sight and recalculated route');
        }, function(err){
            console.log('Modal cancelled, nothing to do here... ' +err);
        })
        */

    };

    $scope.deleteStep = function (number, last) {
        stepsArray[number].routeExpanded = false;

        if (number != 0 && !last && stepsArray.length > 3) //cannot delete origin or destination!
        {
            stepsArray[number].hide = true;
            //wait for animation to complete (1 second), then delete element from array
            $timeout(function () {
                stepsArray.splice(number, 1);
                var newRoutePromise = calcRoute(stepsArray[number - 1].location(), stepsArray[number].location(), stepsArray[number - 1].departure);

                //recalculate all following times:
                recPromiseChain(number, stepsArray.length-1, newRoutePromise);
            }, 1000);
        }

    };

    function calculateSubstepTimes(subSteps, departure){
        var accTime = departure;

        angular.forEach(subSteps, function(value, index){
            if(angular.isDefined(value.transit))
            {
                subSteps[index].departure = value.transit.departure_time.value;
                subSteps[index].arrival = value.transit.arrival_time.value;
            }
            else
            {
                subSteps[index].departure = accTime;
                subSteps[index].arrival = new Date(subSteps[index].departure.getTime() + value.duration.value*1000);
            }
            subSteps[index].departureString = extractTime(''+subSteps[index].departure);
            subSteps[index].arrivalString = extractTime(''+subSteps[index].arrival);
            accTime = subSteps[index].arrival;
        });

        return subSteps;
    }


    var directionsDisplay = [];


    $scope.switchDescription = function (number, last) {
        /*console.log("clickkk"+number);
         console.log(number + " + " +last);
         if(number != 0 && !last)
         {
         calcRoute('37.769710, -122.419849','37.774866, -122.262607', 0);
         }*/
    };

    function extractTime(time) {
        return time.split(' ')[4].substring(0,5); 
    }


    function calcRoute(start, end, departureTime) {
        var deferred = $q.defer(); //create promise
        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.TRANSIT,
            transitOptions: {
                departureTime: departureTime
            }
        };

        directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {

                //var leg = result.routes[0].legs[0];

                //console.log(result.routes[0].legs[0]);
                deferred.resolve(result); //resolve promise with direction result
            }
            else
                deferred.reject(status); //reject promise

        });
        return deferred.promise;

    }

    $scope.swapStep = function (sight) {
        console.log("swapStep");
    }

    $scope.showTips  = function (index) {
        if(index != 0 && index != stepsArray.length-1) {
            console.log('press ' + index);
            stepsArray[index].tipHide = false;
        }
        
    }
    $scope.hideTips  = function (index) {
        console.log('unpress ' + index);
        stepsArray[index].tipHide = true;
    }

    $scope.compareTime = function (time, first) {
        if(timeConstraint.isSelected) {
            try{    

                // first = "22:00";
                // time = "";

                var firstHour = parseInt(first.split(':')[0]); 
                var currentHour = parseInt(time.split(':')[0]);
                var maxHour = parseInt($f('date')(timeConstraint.time, 'HH:mm').split(':')[0]);

                if(firstHour > currentHour) {
                    currentHour += 24;
                }

                if(firstHour > maxHour) {
                    maxHour += 24;
                }

                var maxTime = parseInt(maxHour + "" + $f('date')(timeConstraint.time, 'HH:mm').split(':')[1]);
                var currentTime = parseInt(currentHour+""+time.split(':')[1]);

                console.log('------------------');
                console.log(maxTime);
                console.log(currentTime);
                console.log('------------------');

                if(currentTime > maxTime) {
                    return "disabled-step";
                }

            } catch(e) {

            }
        }
        
    }
}]).directive('myTouchstart', [function() {
                return function(scope, element, attr) {

                    element.on('touchstart', function(event) {
                        scope.$apply(function() { 
                            scope.$eval(attr.myTouchstart); 
                        });
                    });
                };
            }]).directive('myTouchend', [function() {
                return function(scope, element, attr) {

                    element.on('touchend', function(event) {
                        scope.$apply(function() { 
                            scope.$eval(attr.myTouchend); 
                        });
                    });
                };
            }]);






            