app.controller('DistanceCtrl', ['$route', '$scope', '$http', function($route, $scope, $http) {

    $scope.latFrom = 48.1373932;
    $scope.longFrom = 11.5754485;

    $scope.latTo = 48.133826;
    $scope.longTo = 11.582830;

    $scope.doCalculations = function () {
        $http.post('/doCalculations',
            {
                latFrom : $scope.latFrom,
                longFrom : $scope.longFrom,
                latTo : $scope.latTo,
                longTo : $scope.longTo
            })
            .success(function (data, status, headers, config) {
                $scope.calculationResult = data;
                console.log('success (distance controller)! ' + JSON.stringify(data));
            })
            .error(function (data, status, headers, config) {
                console.log("error...");
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };
}]);

