controllerModule.controller('datosInicioCtrl', function ($scope, $rootScope, $state, PlantaFactory, TIAPDAFactory, CargaFactory){
	//OnLoad
    var temp = Rho.System.getPlatform();

	$scope.forms = {};

	var plantas = PlantaFactory.getAll();
	$scope.hr = {
		plantasSelect: '',
		notaTraslado1: '',
		notaTraslado2: '',
		notaTraslado: '',
		plantasSelectOptions: [],
		densidadProducto: 0.51,
		remanente:""
	};
	
	$scope.plantasSelectOptions = plantas;
	$scope.showPeso = true;
	$scope.showDensidadProducto = true;
	
	if($rootScope.previousState == 'app.agenda'){
		var item = TIAPDAFactory.select('Estado', {ID:'1'});
		if(item.Estado == '0'){
			$scope.hr.remanente = 0;
			$scope.showPeso = true;
		}else{
			$scope.hr.remanente = '';
		}
	}else{
		$scope.hr.remanente = '';
	}

	//Boton Siguiente
	$scope.siguiente = function(){

		$scope.formSubmitted = false;
        var numbers = new RegExp(/^[0-9]+$/);

        if(!(numbers.test($scope.hr.notaTraslado1) && numbers.test($scope.hr.notaTraslado2))){
            $scope.formSubmitted = true;
        }

		if($scope.forms.formDatosInicio.$valid && numbers.test($scope.hr.notaTraslado1) && numbers.test($scope.hr.notaTraslado2)){
			$scope.hr.notaTraslado = $scope.hr.notaTraslado1 + "R" + $scope.hr.notaTraslado2;

			//INICIO HOJA DE RUTA
			if($scope.hr.kilosGas != '' && $scope.hr.densidadProducto != '' && $scope.hr.kilometrajeCamion != '' && $scope.hr.plantasSelect != null){
				var impuesto = 0.51;
				if($scope.hr.notaTraslado.length == 13){
					//Update de valores en TIAPDA Según los valores de la pantalla.
					var date = moment().format('YYYYMMDD');
					var time = moment().format('HHmmss');
					var tiapdaObj = {
						Arrastre: '0',
						Fecha: date,
						Hora: time,
						NT: $scope.hr.notaTraslado,
						KG: $scope.hr.kilosGas,
						DP: $scope.hr.densidadProducto,
						KM: $scope.hr.kilometrajeCamion,
						KC: '0',
						PC: $scope.hr.plantasSelect,
						Estado: '1'
					};
					TIAPDAFactory.update(tiapdaObj);

					//Creo una Carga y la guardo en la base de datos.
					var cargaObj = {
						NotaTraslado: $scope.hr.notaTraslado,
						CodigoPlanta: $scope.hr.plantasSelect,
						Fecha: date,
						Hora: time,
						NumeroDocumento: $scope.hr.notaTraslado,
						Densidad: $scope.hr.densidadProducto,
						KgAbastecidos: $scope.hr.kilosGas,
						Kilometraje: $scope.hr.kilometrajeCamion,
						PesoInicial: '0',
						Latitud:  $rootScope.posicionGPSActual.latitud,
						Longitud:  $rootScope.posicionGPSActual.longitud,
						Estado: '0',
						TipoProceso: '5',
						Enviado: 0
					};
					var rhoCargaItem = CargaFactory.create(cargaObj);
					try{
						//Send Cargas to the Back-End
						syncManager.sendMovimientoCarga(function(){});//TODO Manejar el callback
					}catch (e){
						console.log('Error al tratar de enviar las cargas al Back-End desde Inicio hr');
						console.log(e.Message);
						console.log(e);
						showAlert('Total Argentina', 'Error al intentar enviar los datos de la Carga. Revise la conexion. Los datos se enviaran nuevamente.');
					}
					//TODO: SyncronizacionManualItems/SyncronizaCliente/ComprobacionItems
					$state.go('app.agenda');
				}else{
					console.log('Nota de traslado incorrecto.');
					showAlert('Total Argentina', 'Nro. de Nota de traslado Incorrecta.');
				}
			}else{
				showAlert('Total Argentina', 'Revise los campos.');
			}
		}else{
			angular.forEach($scope.forms.formDatosInicio.$error.required, function(field) {
				field.$setDirty();
			});

			showAlert("Atención","Verifique los campos del formulario.")
		}
			};

	//Botón Salir
	$scope.salir = function(){
		if($rootScope.previousState == 'app.agenda'){
			$rootScope.goBack();
		}else{
			Rho.Application.quit();
		}
	};

	$scope.textChangedHandler = function(hr){
		if(hr.notaTraslado.length == 4){
			hr.notaTraslado = hr.notaTraslado + 'R';
		}
	};
});