controllerModule.controller('loginCtrl', function ($scope,$state,$rootScope) {

    //$rootScope.phoneUUID = Rho.System.getProperty('phoneId');

    console.log("loginCtrl");

    $scope.loginUser = {
        username:"",
        password:""
    };

    $scope.validarLogin = function(usernameValid, passwordValid){
        if(usernameValid && passwordValid){
            $state.go('agenda');            
        }
    };

    $scope.cerrarApp = function(){
        Rho.Application.quit();
    };

});