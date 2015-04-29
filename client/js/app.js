var app = angular.module('sightseeing', ['ngRoute', 'ngMaterial', 'ui.bootstrap', 'uiGmapgoogle-maps', 'ngTouch', 'ngAnimate']);
app.constant('sightseeingConfig', {
    'imgSrcPrefix' : 'img/',
    'imgSrcSuffix' : '.png',
    'emptyRouteTemplate' : 'empty_route.html',
    'textualRouteTemplate' : 'template_textual_route.html'
});

app.config(['$routeProvider', '$locationProvider', 'uiGmapGoogleMapApiProvider', function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider){
    $routeProvider
        .when('/fs', {
            templateUrl: 'views/foursquare/view.html',
            controller: 'FourSquareCtrl',
            controllerAs: 'fs'
        })
        .when('/distance', {
            templateUrl: 'views/distance/view.html',
            controller: 'DistanceCtrl',
            controllerAs: 'distance'
        })
        .when('/main', {
            templateUrl: 'views/main/view.html',
            controller: 'MainCtrl',
            controllerAs: 'main'
        })
        .when('/ordering', {
            templateUrl: 'views/ordering/view.html',
            controller: 'OrderingCtrl',
            controllerAs: 'ordering'
        })
        .when('/plan', {
            templateUrl: 'views/plan/plan.html',
            controllerAs: 'plan'
        })
        .when('/map', {
            templateUrl: 'views/map/map.html',
            
            controllerAs: 'map'
        })
        .when('/', {
            templateUrl: 'views/main/index.html',
            controller: 'MainCtrl'
        });

        uiGmapGoogleMapApiProvider.configure({
            //    key: 'your api key',
            v: '3.17',
            libraries: 'places,geometry,visualization'
        });
}]).
    filter('timeformat', function($window){
        return function(input, milliseconds){
            //if milliseconds is set (to true) the input value is in milliseconds, in seconds otherwise
            var formattedString = '';
            var thresholds = (milliseconds) ? {'d': 86400000, 'h': 3600000, 'm':60000} : {'d': 86400, 'h': 3600, 'm' : 60}; //a day, an hour and a minute
            var remainingInput = input;

            angular.forEach(thresholds, function(value, key){
                var factor = $window.Math.floor(remainingInput/value);
                if(factor >= 1)
                {
                    remainingInput = remainingInput%value;
                    formattedString += factor + ' '+key;
                }
            });
            return formattedString;
        };

    }).
    directive('transportLine', function(sightseeingConfig){
        return {
            scope: {
                routestep: '='
            },
            templateUrl: 'views/plan/route.textual.transportstep.html',
            link: function(scope, element, attr){
                scope.transportDescription = scope.routestep.instructions;
                scope.transportDurationText = scope.routestep.duration.text;
                //if it's transit: read the vehicle type (bus, tram, etc.), else take the travel_mode
                scope.transportType = (scope.routestep.travel_mode == 'TRANSIT') ? scope.routestep.transit.line.vehicle.type : scope.routestep.travel_mode;
                scope.transportTransitLine = (scope.routestep.travel_mode == 'TRANSIT') ? scope.routestep.transit.line.short_name+' ' : '';
                scope.transportSymbol = sightseeingConfig.imgSrcPrefix + scope.transportType + sightseeingConfig.imgSrcSuffix;
            }
        };
    }).
    directive('transportLineMap', function(sightseeingConfig){
        return {
            scope: {
                routestep: '=',
                departure: '='
            },
            templateUrl: 'views/plan/route.textual.transportstepmap.html',
            link: function(scope, element, attr){
                var departure = new Date(scope.departure);
                scope.transportDescription = scope.routestep.instructions;
                scope.transportDepartureText = scope.routestep.departureString;
                //if it's transit: read the vehicle type (bus, tram, etc.), else take the travel_mode
                scope.transportType = (scope.routestep.travel_mode == 'TRANSIT') ? scope.routestep.transit.line.vehicle.type : scope.routestep.travel_mode;
                scope.transportTransitLine = (scope.routestep.travel_mode == 'TRANSIT') ? scope.routestep.transit.line.short_name+' ' : '';
                scope.transportTransitStop = (scope.routestep.travel_mode == 'TRANSIT') ? ' - '+scope.routestep.transit.arrival_stop.name : '';
                scope.transportSymbol = sightseeingConfig.imgSrcPrefix + scope.transportType + sightseeingConfig.imgSrcSuffix;
            }
        };
    });;