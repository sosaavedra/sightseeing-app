app.controller('FourSquareCtrl', ['$route', '$scope', '$http', function($route, $scope, $http) {

    $scope.lon = 48.1373932;
    $scope.lat = 11.5754485;
    $scope.radius = 100;

    $scope.requestFS = function () {
        $http.post('/fsexplore',
            {
                ll: $scope.lon + ',' + $scope.lat,
                radius: $scope.radius
            })
            .success(function (data, status, headers, config) {
                $scope.fsResults = data;
            })
            .error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };
}]);

