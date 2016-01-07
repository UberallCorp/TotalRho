controllerModule.controller('descargaCtrl', function ($scope, $state, $rootScope){
	
	//Check que sistema operativo se esta usando:
	$platform = Rho.System.getPlatform();
	$appName = "";
	switch($platform){
		case "ANDROID":
			$appName = "TotalArgentina.apk";
			break;
		case "WM":
			$appName = "TotalArgentina.CAB";
			break;
	}
	var ipServidor = configs.ipServidor.split('/');
	//Llamada a la URL que tiene el APK.
	$url = 'http://' + ipServidor[0] + '/apppda/' + $appName;
	try{
		Rho.System.applicationInstall($url);		
	}catch(e){
		console.log(e);
	}

	$scope.salir = function (argument) {
		Rho.Application.quit();
	}
});