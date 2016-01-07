controllerModule.controller('CierreHrCtrl', function ($scope, $rootScope, $state, PlantaFactory, TIAPDAFactory, MovimientoFactory,GPSFactory, EntregaFactory, CargaFactory, ClientesFactory, PedidosFactory){
	var tiapda = TIAPDAFactory.getElement();
	var plantas = PlantaFactory.getAll();

	$scope.forms = {};

	$scope.hr = {
		plantasSelect: '',
		notaTraslado1: Number(tiapda.NT.slice(0, 4)),
		notaTraslado2:Number(tiapda.NT.slice(5, 13)),
		notaTraslado:tiapda.NT,
		plantasSelectOptions: [],
		densidadProducto: 0.51,
		kilosGas: tiapda.KG,
		remanente:""
	};
	$scope.showNotaTraslado = true;
	$scope.showKilosGas = true;
	$scope.showDensidadProducto = true;
	$scope.plantasSelectOptions = plantas;
	$scope.showPeso = false;
	$scope.showKmCamion = false;

	$scope.callback = function(argument){
		if(argument !== 'undefined'){
			console.log(argument);			
		}
	}

	//function validar_datos(hr){
	//	if($scope.hr.kilosGas != '' && $scope.hr.densidadProducto != '' && $scope.hr.kilometrajeCamion != '' && $scope.hr.plantasSelect != null && $scope.hr.notaTraslado.length == 13){
	//		if($scope.hr.remanente != '' && $scope.hr.remanente >= 0){
	//			return true;
	//		}else{
	//			showAlert('TotalArgentina', 'Debe llenar todos los campos y el peso debe ser mayor o igual que 0');
	//			return false;
	//		}
	//	}else{
	//		showAlert('Total Argentina', 'Error al validar los datos. Por favor revisarlos y volver a intentar. Ningún valor puede ser vacio.');
	//		return false;
	//	}
	//}
	
	$scope.siguiente = function(hr){

		$scope.formSubmitted = true;

		if($scope.forms.formDatosInicio.$valid){
			var diferenciaVenta = tiapda.KG - tiapda.KC;
			var ajuste = diferenciaVenta - $scope.hr.remanente;
			var date = moment().format('YYYYMMDD');
			var time = moment().format('HHmmss');

			MovimientoFactory.create({
				NotaTranslado: $scope.hr.notaTraslado,
				CodigoPlanta: $scope.hr.plantasSelect,
				Fecha: date,
				Hora: time,
				DiferenciaVenta: diferenciaVenta,
				Arrastre: '0',
				Retorno: $scope.hr.remanente,
				Ajuste: ajuste,
				Latitud:  $rootScope.posicionGPSActual.latitud,
				Longitud:  $rootScope.posicionGPSActual.longitud,
				Estado: '0',
				TipoProceso: '8',
				Km: $scope.hr.kilometrajeCamion,
				Enviado: 0
			});

			//Cierro la hoja de ruta.
			try{
				//Trato de enviar todo lo que quede para enviar. 
				syncManager.sendMovimientoCierre(function(){});
				syncManager.sendCierresPendientes($scope.callback());
				syncManager.sendPagosPendientes($scope.callback());
			}catch(e){
				console.log(e);
				console.log(e.message);
				console.log('Error al cerrar la Hoja de ruta.');
			}
			// Se borran todos los contenidos de las tablas que se usen como temporales.
			EntregaFactory.deleteAll();
			PedidosFactory.deleteAll();
			ClientesFactory.deleteAll();

			tiapda.rhoItem.updateAttributes({
				Estado: '0'
			});
			GPSFactory.eliminarPosicionesGPSParaHR($rootScope.nroHojaRuta);

			$rootScope.endGPSService();

			showAlert('Total Argentina', 'Hoja de ruta cerrada con exito.');
			$state.go('app.home');
		}else{
			angular.forEach($scope.forms.formDatosInicio.$error.required, function(field) {
				field.$setDirty();
			});

			showAlert("Atención","Verifique los campos del formulario.")
		}
	}

	$scope.salir = function(){
        Rho.Application.quit();
    };
});