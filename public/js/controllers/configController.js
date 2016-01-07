controllerModule.controller('configCtrl', function ($scope,$state,$rootScope, DatosServiciosFactory,UDFactory) {
	$scope.configOptions = {
		menu: 1,
		newPassword: 2,
		ftp: 3,
		servicios: 4
	};

	$scope.config = {
		adminPassword: "",
		current: $scope.configOptions.menu,
		datosServicios: DatosServiciosFactory.getElement(),
		datosUsuario: UDFactory.selectItem({ID: '1'})
	};

	$scope.login = function(data){
		var elem = $scope.config.datosServicios;
		if(elem.AdminAllow === data){
			$scope.config.loginSuccessful = true;
		}else{
			$scope.config.loginSuccessful = false;
			showAlert("Error", "Clave incorrecta");
		}
	};

	$scope.navigate = function(location){
		$scope.config.current = location;
	};

	$scope.resetPassword = function(){
		var elem = $scope.config.datosServicios;
		elem.rhoItem.updateAttributes({
			AdminAllow: 'admintotal'
		});
		showAlert('Total Argentina', 'Cambio realizado');
		$scope.config.newPassword = '';
	};

	$scope.enterNewPassword = function(newPass){
		var elem = $scope.config.datosServicios;
		elem.rhoItem.updateAttributes({
			AdminAllow: newPass
		});
		showAlert('Total Argentina', 'Cambio realizado');
		$scope.config.newPassword = '';
	};

	$scope.resetServicios = function(){
		var elem = $scope.config.datosServicios;
		elem.rhoItem.updateAttributes({
			IpServer: '200.45.78.234',
			Porcentaje: '10',
			Carpeta: '/sitio/servicios'
		});
		showAlert('Total Argentina', 'Cambio realizado');
		$scope.config.datosServicios = DatosServiciosFactory.getElement();
	};

	$scope.actualizarServicios = function(dataServicios){
		if(dataServicios.IpServer && dataServicios.IpServer !==""
			&& dataServicios.Porcentaje && dataServicios.Porcentaje !==""
			&& dataServicios.Carpeta && dataServicios.Carpeta !=="") {

			var elem = $scope.config.datosServicios;
			elem.rhoItem.updateAttributes({
				IpServer: dataServicios.IpServer,
				Porcentaje: dataServicios.Porcentaje,
				Carpeta: dataServicios.Carpeta
			});
			showAlert('Total Argentina', 'Cambio realizado');

			$scope.config.datosServicios = DatosServiciosFactory.getElement();
			configs.ipServidor = DatosServiciosFactory.getElement().IpServer;
			configs.direccionServicios = DatosServiciosFactory.getElement().Carpeta;
		}else{
			showAlert('Error', 'Debe completar todos los campos');
		}
	};

	$scope.resetFTP = function(){
		var elem = $scope.config.datosUsuario;
		elem.rhoItem.updateAttributes({
			IpFTP: '200.113.183.213',
			DirFTP: '/TotalArgentina/',
			UsuarioFTP: '',
			PassFTP: ''
		});
		showAlert('Total Argentina', 'Cambio realizado');
		$scope.config.datosUsuario = UDFactory.selectItem({ID: '1'});
	};

	$scope.actualizarFTP = function(dataUsuario){
		if(dataUsuario.IpFTP && dataUsuario.IpFTP !==""
			&& dataUsuario.DirFTP && dataUsuario.DirFTP !==""
			&& dataUsuario.UsuarioFTP && dataUsuario.UsuarioFTP !==""
			&& dataUsuario.PassFTP && dataUsuario.PassFTP !=="") {

			var elem = $scope.config.datosUsuario;
			elem.rhoItem.updateAttributes({
				IpFTP: dataUsuario.IpFTP,
				DirFTP: dataUsuario.DirFTP,
				UsuarioFTP: dataUsuario.UsuarioFTP,
				PassFTP: dataUsuario.PassFTP
			});
			showAlert('Total Argentina', 'Cambio realizado');
			$scope.config.datosUsuario = UDFactory.selectItem({ID: '1'});
		}else{
			showAlert('Error', 'Debe completar todos los campos');
		}
	};

	$scope.pantallaEstilos = function(){
		$state.go('app.configEstilos');
	}



});