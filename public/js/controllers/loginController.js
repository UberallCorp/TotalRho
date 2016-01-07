controllerModule.controller('loginCtrl', function ($scope,$state,$rootScope,$q,GPSFactory, $ionicLoading,$log) {

    // On Login Load
    $rootScope.phoneUUID = "272727272727";// ESTEBAN
    //$rootScope.phoneUUID = Rho.System.getProperty('phone_id').replace(/-/g,'').toUpperCase();
    //$rootScope.phoneUUID = "0246A901E348351138000050BF7A60E2"; //USUARIO TD
    //$rootScope.phoneUUID = "0443A1019C4838A1D8000050BF7A60E2"; //USUARIO NUEVO TEST USUARIOS
    //$rootScope.phoneUUID = "01439D019B484CE1"; // USUARIO TC
    //$rootScope.phoneUUID = "01439D019B484DE1"; //LEANDRO
    //$rootScope.phoneUUID = "01439D019B484CE1"; // NICOLAS

    console.log($rootScope.phoneUUID);

    $rootScope.workflowInit = true;
    $rootScope.menuItems = [];

    console.log("loginCtrl");

    $scope.loginUser = {    
        username:"",
        password:""
    };


    $scope.login = function (urlParam) {
        if(Rho.Network.hasNetwork()){
            $ionicLoading.show({
              template: 'Cargando...'
            });
            $.ajax(urlParam)
            .done($scope.loginCallback)
            .fail(function(data) {
                console.log("Error in Login Post GET Request");
                //alert(data);
                $log.error( "Error in Login Post GET Request" );
                showAlert("Error", "Se produjo un error en el Login");
                $ionicLoading.hide();
                return false;
            })
            .always(function() {
                console.log("Login Request Complete");
            });        
        }
        else{
            console.log('No connection available.');
            $log.error( "No connection available." );
            syncManager.modoOffline();
        }
    };

    $scope.loginCallback = function (response) {
        //Al parecer desde el response hay un valor que tiene este string hay que agarrar tod o lo que esté adelante.
        $temp = response.split('->');
        $responseValues = $temp[1].split('#');
        //Parseo el response.
        if($responseValues.length > 0){
            //Status de la consulta del Login.
            $workflowState = $responseValues[0];
            if($responseValues.length > 1){
                $username = $responseValues[1];
                if($responseValues.length > 2){
                    $loginType = $responseValues[2];
                    if($responseValues.length > 3){
                        $version = $responseValues[3];
                        if($responseValues.length > 4){
                            $transportNumber = $responseValues[4];
                            $rootScope.nroHojaRuta = $transportNumber;
                            if($responseValues.length > 5){
                                $systemDate = $responseValues[5];                            
                            }
                        }
                    }
                }
            }
        }
        switch($workflowState){
            case "0":
                //Revisar esto.
                $workflowInit = 1;
                syncManager.firstSync($scope, $rootScope, $state, $ionicLoading, $username, $loginType, $version, $transportNumber, $systemDate);
                break;
            case "1":
                //No hay hojas de ruta activas para este usuario.
                showAlert("Status", "No hay HR Activas para este usuario.");
                $ionicLoading.hide();
                break;
            case "2":
                //Usuario o contraseña incorrectos. Setear esto en el Login para mostrar un mensaje abajo de todo.
                showAlert("Status", "Usuario o contraseña incorrectos.");
                $log.info( "Usuario o contraseña incorrectos." );
                $ionicLoading.hide();
                break;
            case "3":
                //Usuario No asignado.
                showAlert("Status", "Usuario no asignado.");
                $ionicLoading.hide();
                break;
            case "4":
                //Envío de datos incompleto. Faltan datos en la Query String.
                showAlert("Status", "Envio de datos incompleto.");
                $ionicLoading.hide();
                break;
            default:
                showAlert('Status','Envio de parametros erroneo');
                $ionicLoading.hide();
                break;
        }
    };

    function internetConnCallback (argument) {
        $scope.login($url + $queryString);
    }

    $scope.validarLogin = function(){
        //URL para validar los datos del login.
        //Login data validation.
        $url = 'http://' + configs['ipServidor'] + '/' + configs['direccionServicios'] + '/services.aspx?';
        $queryString = 'tr=auth&user=' + $scope.loginUser.username + '&pass=' + $scope.loginUser.password + '&var=' + configs['appVersion'] + '&idpda=' + $rootScope.phoneUUID;
        if(!Rho.Network.hasNetwork()){
            Rho.Network.connectWan('internet', internetConnCallback);
        }else{
            $scope.login($url + $queryString);
        }
        //Asignacion de variables del response.
    };
    $scope.cerrarApp = function(){
        Rho.Application.quit();
    };

    $scope.versionButton = function () {
        showAlert('Total Argentina', 'Version Actual:' + configs['appVersion']);
    };

    $scope.serviceButton = function(){
        $state.go('app.configuracion');
    };

    $scope.testGPS = function () {

        var promise = GPSFactory.iniciarCapturaGPS();
        promise.then(
            function(location){
                if(location){
                    showAlert('Total Argentina', 'Lat: ' + location.latitude + '; Long: ' + location.longitude);
                }
            }
        );
    }
});