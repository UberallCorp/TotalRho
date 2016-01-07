controllerModule.controller('seleccionClienteCobranzaCtrl', function ($scope, $rootScope, $state, ClientesFactory, EntregaFactory){

	//ClientesFactory.loadAll();
	//$scope.clientes = ClientesFactory.clientes;
	$scope.form = {
		clientSearch:""
	};

	$scope.search = function(){
		ClientesFactory.find($scope.form.clientSearch).then(
			function(clientes) {
				if(clientes.length > 0){
					$scope.clientes = clientes;
				}else{
					showAlert("Total Argentina", "No se encontraron registros de clientes con ese nombre");
				}
			});
	};

	$scope.selectCliente = function(cliente){
		var numPed = 'E' + $rootScope.nroHojaRuta.toString() + EntregaFactory.numberOfItems().toString();
		//var entregaElement = EntregaFactory.create({
		//	'Sector': cliente.Sector,
		//	'CodigoStatusPedido': '2',
		//	'NumeroPedido': numPed,
		//	'CodigoCliente': cliente.codigoCliente,
		//	'NombreCliente': cliente.nombreCliente,
		//	'NombreDestinatario': cliente.nombreCliente,
		//	'DireccionDestinatario': cliente.calle,
		//	'Bloqueado': 'N',
		//	'CondicionPago': cliente.condicion_Pago,
		//	'Region': cliente.region,
		//	'Localidad': cliente.localidad,
		//	'IVA': cliente.IVA,
		//	'PercepcionIVA': cliente.PIB,
		//	'IIBB': cliente.PI,
		//	'Zona': cliente.zona,
		//	'Espontaneo': true,
		//	'Precio': cliente.precio,
		//	'CodigoTipoCliente': cliente.codigo_TipoCliente,
		//	'Enviado':'0'
		//});
		//var temp = JSON.stringify(entregaElement);
		$rootScope.idCliente = cliente.codigoCliente;
		$rootScope.numPedidoEsp = numPed;
		$state.go('app.reciboCobranza',{idCliente: cliente.codigoCliente, numPedidoEsp: numPed});
	}

});