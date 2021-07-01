var app = angular.module('app', ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ngFileUpload', 'ui-notification', 'ngAvatar'])

app.config(function ($stateProvider, $locationProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '/client/modules/views/content.html',
      controller: 'ContentController',
      controllerAs: 'vm'
    }).state('home.messages', {
      url: 'messages',
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


app.controller('ContentController', function ($http, Notification, messageService,$state) {
  var vm = this;
  vm.loading = true;

  vm.updateMessage = function () {
    $http.get("/consumer/api/receive-message").then(response => {

      var newMessages = response.data.message;

      if (newMessages.length > 0) {
        messageService.createMessage(newMessages);
        Notification.info({ message: "Received new message.", title: 'Information', positionY: 'top', positionX: 'right' });

      } else {
        messageService.createMessage([]);
      }
      vm.loading = false;
    }).catch(err => {
      console.log(err);
      messageService.createMessage([]);
      vm.loading = false;
      Notification.error({ message: "Error while fetching new messages.", title: 'Error Notification', positionY: 'top', positionX: 'right' });
    });
    
  }

  // updateMessage();
});


app.controller('ConsumerController', function ($scope, $http, $state, Notification, messageService) {
  var vm = this;

  vm.messageList = null;
  vm.loading = true;

  var updateMessage = function () {
    $http.get("/consumer/api/receive-message").then(response => {
      var oldMessage = messageService.getMessage();

      var idList = oldMessage.length > 0 ? oldMessage.map(e => e.id) : [];
      var newMessages = response.data.message.filter(e => !idList.includes(e.id));

      if (newMessages.length > 0) {
        Notification.info({ message: "Received new message.", title: 'Information', positionY: 'top', positionX: 'right' });
        messageService.insertMessage(newMessages);
        $state.reload($state.current.name);
      }
    }).catch(err => {
      console.log(err)
      Notification.error({ message: "Error while fetching new messages.", title: 'Error Notification', positionY: 'top', positionX: 'right' });
    })
  }

  var loadMessage = function(){
    var newMessages = messageService.getMessage()
    vm.messageList = newMessages.length > 0 ? newMessages : null;
  }

  loadMessage();
  setInterval(() => {
    updateMessage();

  }, 10000)
});