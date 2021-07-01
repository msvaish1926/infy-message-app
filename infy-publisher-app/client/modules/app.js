var app = angular.module('app', ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ngFileUpload', 'ui-notification'])

app.config( function ($stateProvider, $locationProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/client/modules/views/publisher.html',
        controller: 'PublisherController',
        controllerAs: 'vm'
      })
    $locationProvider.html5Mode(true);
});

app.controller('PublisherController', function($scope, $http, $timeout, Upload, Notification) {
    var vm=this;
    $scope.files = [];
    $scope.invalidFiles = [];
    $scope.validate = '{size: {max: \'20MB\',min: \'10B\'}}';
    $scope.dragOverClass = '{accept: \'dragover\', reject: \'dragover-err\', pattern: \'application/json\'}';

    $scope.uploadOptions = {
        acceptSelect : "application/json",
        pattern : "application/json",
        maxFiles : 5,
        keep : false,
        runAllValidations : true,
        multiple : true,
        dropAvailable : true
    }

    $scope.$watch('invalidFiles', function (invalidFiles) {
        if ((invalidFiles != null && !Array.isArray(invalidFiles)) || (Array.isArray(invalidFiles) && invalidFiles.length > 0)) {
          $timeout(function () {
              if($scope.files.length === 5){
                Notification.error({message: 'App can only send 5 files at a time.',title: 'Error Notification', positionY: 'top', positionX: 'right'});
            }else{
                Notification.error({message: 'Error while reading file data.',title: 'Error Notification', positionY: 'top', positionX: 'right'});
              }
          });
        }
      });
    
      $scope.$watch('files', function (files) {
        $scope.formUpload = false;
        if (files != null) {
          // make files array for not multiple to be able to be used in ng-repeat in the ui
          if (!Array.isArray(files)) {
            $timeout(function () {
              $scope.files = files = [files];
            });
            return;
          }
          for (var i = 0; i < files.length; i++) {
            (function (f) {
              $scope.upload(f);
            })(files[i]);
          }
        }
      })

      $scope.upload = function (file) {
        
        Upload.upload({
            url : '/publisher/api/send-message',
            data : {publish : file}
        }).then(response=>{
            Notification.success({message: 'Message sent successfully to the consumer',title: 'Success Notification', positionY: 'top', positionX: 'right'});
        }).catch(err=>{
            Notification.error({message: 'Error while sending the message',title: 'Error Notification', positionY: 'top', positionX: 'right'});
        })
      };


});