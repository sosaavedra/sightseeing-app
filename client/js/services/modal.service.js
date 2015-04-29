angular.module('sightseeing').
    factory('ModalService', function($modal){
        var openModal = function($scope, shufflePromise, oldVenue)
        {

            var modalInstance = $modal.open({
                templateUrl: 'change_route_modal.html',
                controller: 'ModalInstanceCtrl',
                //inject variables:
                resolve: {
                    shufflePromise: function () {
                        return shufflePromise;
                    },
                    oldVenue: function() {
                        return oldVenue;
                    }
                }
            });
            return modalInstance; //when this gets resolved, user finished with the modal
        };

        //return service functions:
        return {
            openModal: openModal
        }
    }).
    controller('ModalInstanceCtrl', function($q, $scope, $modalInstance, shufflePromise, oldVenue){

        var shPromise = $q.when(shufflePromise); //wrap in promise, if already resolved

        $scope.buOkLabel = '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...';
        $scope.modalTemplate = 'modal_loading.html';
        $scope.sights = [];
        $scope.selectedSight = {};
        $scope.oldVenue = oldVenue;
        $scope.selectedSightText = '...'
        $scope.selectSight = function(index){
            $scope.selectedSight = $scope.sights[index];
            $scope.selectedSightText = ' '+$scope.selectedSight.obj.sight.venue.name;
        };

        shPromise.then(function(result){
            //new sights returned from the server
            $scope.buOkLabel = 'OK'; //change the label from Loading to OK
            $scope.sights = result.data.results;
            $scope.modalTemplate = 'modal_select_venue.html';
        }, function(err){
            $scope.buOkLabel = 'Err...';
            console.log('Oh no...' + err);
        });

        $scope.ok = function () {
            if($scope.buOkLabel == 'OK' && $scope.selectedSight != {})
            {
                $modalInstance.close($scope.selectedSight);
            }
        };


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });