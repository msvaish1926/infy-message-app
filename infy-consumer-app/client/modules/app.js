var app = angular.module('app', ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ngFileUpload', 'ui-notification', 'ngAvatar'])

app.config(function ($stateProvider, $locationProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      params: {
        loadUpdate: null,
      },
      templateUrl: '/client/modules/views/consumer.html',
      controller: 'ConsumerController',
      controllerAs: 'vm'
    });
  $locationProvider.html5Mode(true);
});

//define factory  named 'myFactory'
app.factory('messageService', function () {
  var obj = {};
  obj.message = [];
  obj.createMessage = function (newMessages) {
    obj.message = newMessages.slice().reverse();;
  };
  obj.insertMessage = function (newMessages) {
    obj.message = newMessages.slice().reverse().concat(obj.message);
  }
  obj.getMessage = function () {
    return obj.message;
  }
  return obj;
});

app.controller('ConsumerController', function ($scope, $http, $state, Notification, messageService) {
  var vm = this;
  vm.loading = $state.params.loadUpdate ? false : true;
  vm.loadUpdate = false;
  vm.messageList = null;


  var createMessage = function () {
    vm.loading = true;
    $http.get("/consumer/api/receive-message").then(response => {

      var newMessages = response.data.message;

      if (newMessages.length > 0) {
        messageService.createMessage(newMessages);
      } else {
        messageService.createMessage([]);
      }
      
      setTimeout(() => {
        if(newMessages.length >0){
          Notification.info({ message: "Received new message.", title: 'Information', positionY: 'top', positionX: 'right' });
        }
        vm.loading = false;
        $state.go($state.current, {loadUpdate: "YES"}, {reload: true});
      }, 1000);

    }).catch(err => {
      console.log(err);
      messageService.createMessage([]);
      vm.loading = false;
      Notification.error({ message: err.data.message || "Error while fetching new messages.", title: 'Error Notification', positionY: 'top', positionX: 'right' });
    });
    
  }

  var updateMessage = function () {
    $http.get("/consumer/api/receive-message").then(response => {
      var oldMessage = messageService.getMessage();

      var idList = oldMessage.length > 0 ? oldMessage.map(e => e.id) : [];
      var newMessages = response.data.message.filter(e => !idList.includes(e.id));

      if (newMessages.length > 0) {
        Notification.info({ message: "Received new message.", title: 'Information', positionY: 'top', positionX: 'right' });
        messageService.insertMessage(newMessages);
        $state.go($state.current, {loadUpdate: "YES"}, {reload: true});
      }
    }).catch(err => {
      console.log(err)
      Notification.error({ message: err.data.message || "Error while fetching new messages.", title: 'Error Notification', positionY: 'top', positionX: 'right' });
    })
  }

  var loadMessage = function(){
    var newMessages = messageService.getMessage()
    vm.messageList = newMessages.length > 0 ? newMessages : null;
    vm.loadUpdate = true;
  }

  if($state.params.loadUpdate){
    loadMessage();
    setInterval(() => {
      updateMessage();
    }, 10000);
  }else{
    createMessage();
  }




});