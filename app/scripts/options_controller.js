'use strict';

ngApp.
  factory('mblistData', ['$q',function ($q) {
    var _cache = {
      'mbList':[]
    },
    needCheck = true
    ;

    function _getAll () {
      var deferred = $q.defer();

      chrome.storage.local.get('bmIdArr', function(arrData) {
        _cache.mbList = [];
        if(arrData.bmIdArr && arrData.bmIdArr.length) {
          _cache.mbList = arrData.bmIdArr;
          deferred.resolve(arrData.bmIdArr);
          needCheck = false;
        }else {
          deferred.reject([]);
        }
      });

      return deferred.promise;

    }
  
    return {
      /**
       * 获取所有list信息
       * @return 
       */
      getAll: function(){
        if(needCheck || _cache.mbList.length === 0) {
          return _getAll();
        }else {
          var deferred = $q.defer();
          deferred.resolve(_cache.mbList);
          return deferred.promise;
        }
      },
      /**
       * 获取单个信息
       */
      getId: function (id) {

      },
      checkNext: function() {
        needCheck = true;
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