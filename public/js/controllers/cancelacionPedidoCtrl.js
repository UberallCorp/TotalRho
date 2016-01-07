controllerModule.controller('cancelacionPedidoCtrl', function ($scope,$stateParams,$rootScope,EntregaFactory,PedidosFactory,MotivoFactory,ClientesFactory,WS,$ionicLoading,$state) {

    //No Menu items for this.
    //$rootScope.menuItems = [];


    $scope.entrega = EntregaFactory.findById($stateParams.numeroPedido);
    $scope.pedido = PedidosFactory.findById($stateParams.numeroPedido);

    $scope.datosForm = {
        idMotivo : ""
    };

    if($scope.pedido.EstadoBloqueoReclamo === 'B'){
        $scope.motivos = MotivoFactory.getMotivoParaBloqueado();
    }else{
        $scope.motivos = MotivoFactory.getAll();
    }

    console.log($scope.motivos);

    $scope.volver = function(){
        $rootScope.goBack();
    };

    $scope.finalizar = function(){
        //GEOLOCALIZAR() TODO

        $scope.pedido.rhoItem.updateAttributes({
                CodigoStatusPedido: 3
            }
        );

        var cliente = ClientesFactory.findById($scope.pedido.CodigoCliente);

        var fechaActual = new moment().format("YYYYMMDD");
        var horaActual =  new moment().format("HHmmss");

        if($scope.entrega){
            $scope.entrega.rhoItem.updateAttributes({
                    CodigoStatusPedido: 3,
                    TipoVenta:2,
                    NumeroPedido: $scope.pedido.NumeroPedido,
                    CodigoCliente: cliente.codigoCliente,
                    Fecha:fechaActual,
                    CodigoMotivo:$scope.datosForm.idMotivo,
                    Estado:0,
                    FechaEnv:horaActual,
                    Latitud: $rootScope.posicionGPSActual.latitud,
                    Longitud: $rootScope.posicionGPSActual.longitud,
                    Enviado:0
                }
            );
        }else{
            var entregaElement = EntregaFactory.create({
                'TipoVenta':2,
                'NumeroPedido': $scope.pedido.NumeroPedido,
                'CodigoCliente': cliente.codigoCliente,
                'Fecha':fechaActual,
                'CodigoMotivo':$scope.datosForm.idMotivo,
                'Estado':0,
                'FechaEnv':horaActual,
                'Latitud':  $rootScope.posicionGPSActual.latitud,
                'Longitud':  $rootScope.posicionGPSActual.longitud,
                'Enviado':0
            });
        }

        $ionicLoading.show({
            template: 'Cargando...'
        });

        $rootScope.datosCalculadora = null;

        syncManager.sendPendientes(function(result){
            $ionicLoading.hide();

            if(result == "Todo procesado"){
                showAlert("Exito","Venta cancelada.");
            }else{
                showAlert("Error","Hubo un problema cancelando la venta. Se intentará nuevamente en la próxima sincronización.");
            }

            $state.go('app.agenda');
        });
    };

});