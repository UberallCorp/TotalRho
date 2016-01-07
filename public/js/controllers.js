/**
 * Created by Ea
 */

var controllerModule = angular.module('controllerModule',['ionic','ui.router','factoriesModule']);



controllerModule.controller('detalleEntregaCtrl', function ($scope,$stateParams,$rootScope,PedidosFactory,WS,$state) {
    $scope.pedido = $stateParams.pedido;

    $scope.sitPedida = ($scope.pedido.SIT == 1);

    $scope.irACalculadora = function(){
        $state.go('calculadora');
    };
});
controllerModule.controller('calculadoraCtrl', function ($scope,$state) {

    $scope.opcionSelect = "Litros => Pesos";
    $scope.inputLabel = "Litros :";

    $scope.valoresLabelInput = ["Litros :","Kilos :","Pesos :","Pesos :"];
    $scope.opcionesSelect = ["Litros => Pesos","Kilos => Pesos","Pesos => Litros","Pesos => Kilos"];

    $scope.cambioSelect = function(seleccion){
        $scope.inputLabel = getLabelFromSelectedOption( seleccion );
    };

    function getLabelFromSelectedOption( value ) {
        for ( var i = 0 ; i < $scope.opcionesSelect.length ; i++ ) {
            if ( $scope.opcionesSelect[ i ] === value ) {
                return( $scope.valoresLabelInput[ i ] );
            }
        }
        return( null );
    }

    $scope.volverAEntrega = function(){
        $state.go('^');
    }
});