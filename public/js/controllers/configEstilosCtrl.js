controllerModule.controller('configEstilosCtrl', function ($scope, $state, $rootScope, $ionicLoading, $stateParams, ConfigPantallaFactory){
	//$scope.forms={};
	
	$scope.fontSize = [
	{text:'Pequeño', value: 1},
	{text:'Mediano', value:2},
	{text:'Grande', value:3}];

	$scope.contrast =[
	{text:'Bajo', value:1},
	{text:'Medio', value:2},
	{text:'Alto', value: 3}
	];

	var oldConfig = ConfigPantallaFactory.getConfig();

	$scope.data ={
		fontSizeOption : oldConfig.FontSize,
		contrastOption : oldConfig.Contrast
	};

	$scope.ingresar = function(item){
		ConfigPantallaFactory.update({
			FontSize: $scope.data.fontSizeOption,
			Contrast: $scope.data.contrastOption
		});
		$rootScope.configPantalla($scope.data.fontSizeOption, $scope.data.contrastOption);
		showAlert('Total Argentina', 'Las configuraciones de pantalla se han actualizado con éxito');
		console.log('Configuraciones de pantalla realizadas.');
	}
});
