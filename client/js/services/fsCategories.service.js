angular.module('sightseeing')
  .factory('fsCategoriesService', ['$http', '$q', function($http, $q) {
      var fsCategories;

      function getAllCategories() {
        return $http.get('/getVeneuesCategories'
        ).then(function (response) {
            if (typeof  response.data == 'object') {
              return response.data;
            } else {
              $q.reject(response.data);
            }
          }, function(response) {
            return $q.reject(response.data);
          });
      }

      return {
        getAll: function () {
          if(angular.isDefined(fsCategories)){
            return $q.when(fsCategories);
          }

          return getAllCategories().then(
            function(data){
              fsCategories = data;
              return fsCategories;
            });
        }
      };

    }]);