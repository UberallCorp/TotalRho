/**
 * Created by Ea
 */

var controllerModule = angular.module('controllerModule',['ionic','ui.router','factoriesModule']);

controllerModule.controller('agendaCtrl', function ($scope,$state,$rootScope,PedidosFactory,ClientesFactory,WS) {
    $scope.pedidos = PedidosFactory.pedidos;

    $scope.crearPedido = function(){

        ClientesFactory.create({NombreCliente: "Cliente Uno",
            CodigoCliente:"123112",
            Cuit:"93939",
            Calle: "Gascon 21",
            Localidad: "Capital Federal",
            Telefono: "4-823-2323",
            Codigo_TipoCliente: "Factura A",
            Condicion_Pago: "Condicion de Pago 1",
            Observacion:"esta es la observ."
        });

        PedidosFactory.create({Nombre_Cliente: "Cliente Uno",
            Latitud:"3939",
            Longitud:"93939",
            Localidad: "Capital Federal",
            Observacion: "esta es la observ.",
            NumeroPedido: "10",
            Direccion_Destinatario: "Rivadavia 2",
            Codigo_cliente: "123112",
            Fecha: new Date(),
            SIT:1,
            Cuit:"39393300303"
        });

//        $.getJSON($rootScope.baseURL+"tr=auth&user=usuariotb&pass=utb&var=201&idpda=0943A1019C48E75138000050BF7A60E2",
//            {},
//            function(content){
//               alert(content);
//            });

//        WS.getMethod("tr=auth&user=usuariotb&pass=utb&var=201&idpda=0943A1019C48E75138000050BF7A60E2")
//            .then(function (data) {
//                // promise fulfilled
//                alert(data);
//            }, function (error) {
//                // promise rejected
//                alert("error, la promesa del get fue rejected");
//        });
    };

    $scope.irADetallePedido = function(pedido){

        pedido.cliente = ClientesFactory.findById(pedido.codigo_cliente);

        $state.go('app.detalleEntrega',{pedido:pedido});
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
        $state.go('app.^');
    }
});