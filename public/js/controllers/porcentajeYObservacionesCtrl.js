controllerModule.controller('porcentajeYObservacionesCtrl', function ($scope, $state, $rootScope, $ionicLoading, $stateParams, EntregaFactory, PedidosFactory){
	$scope.forms={};
	
	$scope.ValidFormObs = false;
	
	$scope.entrega = EntregaFactory.findById($stateParams.numeroPedido);
	$scope.pedido = PedidosFactory.findById($stateParams.numeroPedido);

	$scope.datos={
		porcentajeInicial : '',
		porcentajeFinal : '',
		observaciones : ''
	};

    $scope.volver = function(){
        $scope.entrega.rhoItem.updateAttributes(
            {CodigoStatusPedido: 2}
        );
        $scope.pedido.rhoItem.updateAttributes(
            {CodigoStatusPedido: 2}
        );
		$rootScope.goBack();
    };

	//Funcion del botón siguiente.
	$scope.siguiente = function(){
		if($scope.datos.observaciones.length > 0 && $scope.datos.observaciones.length <= 100){
			if($scope.forms.cargaYObservaciones.$valid){
				console.log("formulario Válido");

				$scope.entrega.rhoItem.updateAttributes({
					PorcentajeInicial: $scope.datos.porcentajeInicial,
					PorcentajeFinal: $scope.datos.porcentajeFinal,
					Observaciones: $scope.datos.observaciones
				});

				$ionicLoading.show({
	                template: 'Cargando...'
	            });

	            $rootScope.datosCalculadora = null;

	            syncManager.sendPendientes(function(result){
	                $ionicLoading.hide();

	                if(result == "Todo procesado"){
	                    showAlert("Exito","Venta finalizada.");
	                }else{
	                    showAlert("Error","Hubo un problema cerrando la venta. Se intentará nuevamente en la próxima sincronización.");
	                }
	                $state.go('app.agenda');
	            });
			}			
		}else{
			$scope.ValidFormObs = true;
		}

	}
});