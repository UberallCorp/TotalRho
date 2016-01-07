controllerModule.controller('menuCtrl', function ($scope, $state, $rootScope, PedidosFactory){
	$scope.items = $rootScope.menuItems;

	$scope.showAgendaButton = function (){
		return $state.current.name === 'app.agenda';
	};

	$scope.cierre = function (){
		var pedidos = PedidosFactory.pedidosAgenda();
		var pedidosNoCancelados = [];
		$.each(pedidos,function(){
			if(this.Reclamo.indexOf('C') == -1){
				pedidosNoCancelados.push(this);
			}
		});
		if(pedidosNoCancelados.length <= 0){
			$state.go('app.cierreHR');
		}else{
			showAlert('Total Argentina', 'Quedan pedidos no cancelados por cerrar');
		}
	};

	$scope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams){
		$scope.items = $rootScope.menuItems;
		$rootScope.currentState = toState.name;
	});
});