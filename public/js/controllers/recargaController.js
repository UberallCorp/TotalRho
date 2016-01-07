controllerModule.controller('recargaController', function ($scope, $rootScope, $state, TIAPDAFactory, PlantaFactory, CargaFactory, MovimientoFactory){
	//ON LOAD
	var date = moment().format('YYYYMMDD');
	var time = moment().format('HHmmss');
	var tiapda = TIAPDAFactory.getElement();
	if(tiapda.Estado == '1'){
		var plantas = PlantaFactory.getAll();
		$scope.hr = {
			plantasSelect: '',
			notaTraslado: tiapda.NT,
			plantasSelectOptions: [],
			densidadProducto: 0.51
		};
		$scope.plantasSelectOptions = plantas;
	}else{
		showAlert('Total Argentina', 'Ventas Cerradas');
		$state.go('app.agenda');
	}

	$scope.siguiente = function(hr){
		if(hr.notaTraslado != '' && hr.kilosGas != '' && hr.densidadProducto != '' && hr.plantasSelect != '' && hr.remanente != ''){
			var diferenciaVenta = parseFloat(tiapda.KG) - parseFloat(tiapda.KC);
			var retorno = parseFloat(hr.remanente) * (-1);
			var ajuste = (diferenciaVenta + retorno) * (-1);
			var kilosIngresados = parseFloat(hr.remanente) + parseFloat(hr.kilosGas);
			TIAPDAFactory.update({
				KG: kilosIngresados,
				DP: hr.densidadProducto,
				Estado: '1',
				KM: hr.kilometrajeCamion,
				KC: '0',
				PC: hr.plantasSelect,
				Fecha: date,
				Hora: time
			});

			//TODO: GEOLOCALIZACION!

			//Creo una carga.
			CargaFactory.create({
				NotaTraslado: hr.notaTraslado,
				CodigoPlanta: hr.plantasSelect,
				Fecha: date,
				Hora: time,
				NumeroDocumento: hr.notaTraslado,
				Densidad: hr.densidadProducto,
				KgAbastecidos: hr.kilosGas,
				Kilometraje: hr.kilometrajeCamion,
				PesoInicial: hr.remanente,
				Latitud:  $rootScope.posicionGPSActual.latitud,
				Longitud:  $rootScope.posicionGPSActual.longitud,
				Estado: '0',
				TipoProceso: '6',
				Enviado: '0'
			});

			//Creo un Movimiento
			MovimientoFactory.create({
				NotaTraslado: hr.notaTraslado,
				NumeroDocumento: hr.notaTraslado,
				CodigoPlanta: hr.plantasSelect,
				Fecha: date,
				Hora: time,
				DiferenciaVenta: diferenciaVenta,
				Arrastre: retorno,
				Retorno: '0',
				Ajuste: ajuste,
				Latitud:  $rootScope.posicionGPSActual.latitud,
				Longitud:  $rootScope.posicionGPSActual.longitud,
				Estado: '0',
				TipoProceso: '7',
				Enviado: '0'
			});

			try{
				syncManager.sendMovimientoRecarga(function(){});//TODO Manejar callback
			}catch(e){
				console.log('Error al enviar Movimiento Recarga');
				console.log(e);
			}

			//Vuelvo a la Agenda.
			$state.go('app.agenda');

		}else{
			showAlert('Total Argentina', 'Ningun campo puede estar vacio');
		}
	}
});