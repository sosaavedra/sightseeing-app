app.controller('MongoCtrl', ['$route', '$scope', '$http', function($route, $scope, $http) {

    $scope.command = 100;

    $scope.requestMongoDb = function () {
        $http.post('/requestMongoDb',
            {
                command: $scope.command
            })
            .success(function (data, status, headers, config) {
                $scope.mongoResult = data;
            })
            .error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    $scope.getMoreSightOptions = function () {
        $http.post('/getMoreSightOptions',
          {
              routeId: $scope.routeId,
              previousSight: {
                  lat: $scope.lat,
                  long: $scope.long
              }
          })
          .success(function (data, status, headers, config) {
              $scope.mongoShowMorePlaces = data;
          })
          .error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
          });
    };
}]);

