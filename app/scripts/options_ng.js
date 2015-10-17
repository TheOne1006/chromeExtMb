'use strict';

/**
 * @ngdoc chromeExtMb Option页面
 * @name mbOptions
 * @description module 加载
 * Main module of the application.
 */
var ngApp;
ngApp = angular.module('mbOptions', [
  'ui.router',
  'ui.bootstrap'
]);


/**
 * 路由
 */
ngApp
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider ) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home',{
        url:'/',
        views: {
            'main':{
              templateUrl:'views/bookMarksList.html',
              controller:'listCtrl'
            }
          }
        });
  }
]);
