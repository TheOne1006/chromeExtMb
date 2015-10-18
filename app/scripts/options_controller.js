'use strict';

ngApp.
  factory('mblistData', ['$q',function ($q) {
    return {
      /**
       * 获取所有list信息
       * @return 
       */
      getAll: function(){
        var deferred = $q.defer();
        chrome.runtime.sendMessage({'action':'getAll'},function(data){
          // console.log(data);
          deferred.resolve(data);
        });

        return deferred.promise;
      },
      /**
       * 获取单个信息
       */
      getId: function (id) {

      }
    };
  }])
  //controller
  .controller('headerCtrl', ['$scope', function ($scope) {
    
  }])
  .controller('listCtrl', ['$scope','mblistData', function ($scope, mblistData) {
    var mbListInit = [];

    $scope.bmIdArr = [];

    mblistData.getAll().then(function(dataArr){
      mbListInit = dataArr;
      $scope.bmIdArr = dataArr;
    });


    
  }])
  ;