controllerModule.controller('reciboCobranzaCtrl', function ($scope, $rootScope, $state, $stateParams, EntregaFactory){

	$scope.idCliente = $rootScope.idCliente;
	$scope.numPedidoEsp = $rootScope.numPedidoEsp;

	$scope.formRemito={
		remito1: "",
		remito2: ""
	};

	$scope.formSubmitted = false;

	$scope.forms = {};

	$scope.siguiente = function(){
		$scope.formSubmitted = true;

		var numbers = new RegExp(/^[0-9]+$/);

        if(!(numbers.test($scope.formRemito.remito1) && numbers.test($scope.formRemito.remito2))){
            $scope.formSubmitted = false;
        }

		if($scope.forms.formRemito.$valid && $scope.formSubmitted){
			var numeroRecibo = $scope.formRemito.remito1+'R'+$scope.formRemito.remito2;

			console.log(numeroRecibo);
			$rootScope.numeroRecibo = numeroRecibo


			$state.go('app.detalleMedioPagoCobranza',{idCliente:$scope.idCliente, numPedidoEsp: $scope.numPedidoEsp, numRecibo: numeroRecibo});
		}else{
			showAlert("Atención","Verifique el número de recibo ingresado.");
		}
	};
});