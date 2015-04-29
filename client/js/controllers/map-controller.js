app.controller('MapCtrl', ['$route', '$timeout', 'map', '$scope', '$http', '$interval', 'uiGmapIsReady', 'coords', 'venues', 'stepsArray', 'dateFilter', function($route, $timeout, map, $scope, $http, $interval, IsReady, coords, venues, stepsArray, df){


    angular.extend($scope, {
        map: map
    });

    $scope.control = {};
    $scope.currentStep = 0;

    $scope.steps = stepsArray;

    $scope.publicTransportOpened = false;

    $scope.currentPublicTransport = {};
    
    $scope.marker = {
          id: 0,
          options: { draggable: false }
    };
    
    /*
    temporarily switched off due to performance issues on my machine (Simon)

    $interval(function(){
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                console.log(position);
                $scope.marker.coords = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                };

            }, function() {
              handleNoGeolocation(true);
            });
        }
    }, 5000);*/



    //var map;
    var markerArray = [];
    var stepDisplay = new google.maps.InfoWindow();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    //directionsDisplay.setMap($scope.map);



    var icons = {
      a: new google.maps.MarkerImage(
       'img/markerA.png',
       new google.maps.Size( 33, 41 ),
       new google.maps.Point( 0, 0 ),
       new google.maps.Point( 16, 41 )
      ),
      b: new google.maps.MarkerImage(
       'img/markerB.png',
       new google.maps.Size( 33, 41 ),
       new google.maps.Point( 0, 0 ),
       new google.maps.Point( 16, 41 )
      ),
      c: new google.maps.MarkerImage(
       'img/markerC.png',
       new google.maps.Size( 33, 41 ),
       new google.maps.Point( 0, 0 ),
       new google.maps.Point( 16, 41 )
      ),
      d: new google.maps.MarkerImage(
       'img/markerD.png',
       new google.maps.Size( 33, 41 ),
       new google.maps.Point( 0, 0 ),
       new google.maps.Point( 16, 41 )
      ),
      e: new google.maps.MarkerImage(
       'img/markerE.png',
       new google.maps.Size( 33, 41 ),
       new google.maps.Point( 0, 0 ),
       new google.maps.Point( 16, 41 )
      ),
        x: new google.maps.MarkerImage(
            'img/markerX.png',
            new google.maps.Size( 33, 41 ),
            new google.maps.Point( 0, 0 ),
            new google.maps.Point( 16, 41 )
        ),
        y: new google.maps.MarkerImage(
            'img/markerY.png',
            new google.maps.Size( 33, 41 ),
            new google.maps.Point( 0, 0 ),
            new google.maps.Point( 16, 41 )
        ),
      instructions: new google.maps.MarkerImage(
       'img/instructionsMarker.png',
       new google.maps.Size( 20, 20 ),
       new google.maps.Point( 0, 0 ),
       new google.maps.Point( 10, 10 )
      )
    };

    IsReady.promise().then(function (maps) {

        //only show current steps:
        directionsDisplay.setMap(maps[0].map);
        showRoute(0);


        /*
        //startpoint
        directionsDisplay.push(new google.maps.DirectionsRenderer());
        directionsDisplay[0].setMap(maps[0].map);
        map = maps[0].map;
        calcRoute(coords.origin.lat+","+coords.origin.lng, venues.sights[0].venue.location.lat+","+venues.sights[0].venue.location.lng, 0, new Date())


        /*for(var i=1; i<=venues.sights.length; i++ ) {
            directionsDisplay.push(new google.maps.DirectionsRenderer());

            directionsDisplay[i].setMap(maps[0].map);
            map = maps[0].map;


            console.log('trying to access '+i);
            console.log(venues.sights[i-1].venue);


            //calculate directions:
            if(i != venues.sights.length)
                calcRoute(venues.sights[i-1].venue.location.lat+","+venues.sights[i-1].venue.location.lng, venues.sights[i].venue.location.lat+","+venues.sights[i].venue.location.lng, i);
            else
            {
                console.log('calculating route from '+venues.sights[i-1].venue.name+' to '+coords.target.lat + ','+coords.target.lng);
                calcRoute(venues.sights[i-1].venue.location.lat+","+venues.sights[i-1].venue.location.lng, coords.target.lat+","+coords.target.lng, i)
            }

        }*/

        
    });


    /**
     * this function gets called, when a user clicks on a certain step, or hits the next button to toggle to the next
     * step of the detourist route
     *
     * if the route step is already activated (index == $scope.currentStep) this function is used to toggle information
     * about public transport in the current step
     *
     */

    $scope.activateStep = function(index)
    {
        //check if the step is already displayed - then open or close current public transport info

        if(index != $scope.currentStep) {
            if($scope.publicTransportOpened) {
                $scope.publicTransportOpened = false;

                //timeout to wait for out animation
                $timeout(function(){
                    $scope.currentStep = index;
                    $scope.currentPublicTransport = stepsArray[index].route.routes[0].legs[0].steps;
                    showRoute(index);
                },500);

            }
            else {
                $scope.currentStep = index;
                $scope.currentPublicTransport = stepsArray[index].route.routes[0].legs[0].steps;
                showRoute(index);
            }

        }
        else {
            //toggle public transport window
            $scope.publicTransportOpened = !$scope.publicTransportOpened;
        }
    }

    //function to show a certain route

    function showRoute(index) {


        directionsDisplay.setDirections(stepsArray[index].route);

        //showSteps(result);

        var leg = stepsArray[index].route.routes[0].legs[0];

        /*steps[index+1].time = df(new Date(leg.arrival_time.value), 'HH:mm');
         steps[index+1].timevalue = new Date(leg.arrival_time.value);*/
        /*

        if (index == 1) {
            makeMarker(leg.start_location, icons.a, "title");
            makeMarker(leg.end_location, icons.b, 'title');
        } else if (index == 2) {
            makeMarker(leg.start_location, icons.b, "title");
            makeMarker(leg.end_location, icons.c, 'title');
        } else if (index == 3) {
            makeMarker(leg.start_location, icons.c, "title");
            makeMarker(leg.end_location, icons.d, 'title');
        } else if (index == 4) {
            makeMarker(leg.start_location, icons.d, "title");
            makeMarker(leg.end_location, icons.e, 'title');
        } else if (index == 5) {
            makeMarker(leg.start_location, icons.x, "title");
            makeMarker(leg.end_location, icons.y, 'title');
        }
        */
    }


    function showSteps(directionResult) {
        var myRoute = directionResult.routes[0].legs[0];

        for (var i = 0; i < myRoute.steps.length; i++) {
          var marker = new google.maps.Marker({
            position: myRoute.steps[i].start_location,
            map: $scope.map,
            icon: icons.instructions
          });
          attachInstructionText(marker, myRoute.steps[i].instructions);
          markerArray[i] = marker;
        }
    }


    function attachInstructionText(marker, text) {
      google.maps.event.addListener(marker, 'click', function() {
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
      });
    }

    function makeMarker( position, icon, title ) {
     new google.maps.Marker({
      position: position,
      map: $scope.map,
      icon: icon,
      title: title,
      zIndex: google.maps.Marker.MAX_ZINDEX + 100
     });
    }

        $scope.steps = stepsArray;

        $scope.deleteStep = function () {
            console.log("delete");
        };

      

}]);