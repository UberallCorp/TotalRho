/**
 * Created by Leandro on 19/06/2015.
 */
controllerModule.controller('agendaCtrl', function ($scope, $state, $rootScope, $ionicLoading,
                                                    PedidosFactory,
                                                    ClientesFactory,
                                                    GPSFactory,
                                                    UDFactory,
                                                    TIAPDAFactory,
                                                    WS) {

    //syncManager.testGPS(GPSFactory);

    $scope.pedidos = [];
    $scope.user = syncManager.getDatosUsuario();
    $scope.user.NT = TIAPDAFactory.getElement().NT;

    //Items del side-menu. Sino hay opciones dejarlo vacio.
    $rootScope.menuItems = [
        {name:'Carga de gas', href:'app.recarga'},
        {name:'Cobranza', href:'app.seleccionClienteCobranza'},
        {name:'Venta Espontanea', href:'app.seleccionCliente'},
    //    {name: 'Cierre Hoja de Ruta', href:'app.cierreHR'}
    ];

    $rootScope.startGPSService();


    $rootScope.recuperarPedidos = function() {

        $scope.pedidos.length = 0;

        var pedidosDB = PedidosFactory.pedidosAgenda();

        //Procesar elementos a mostrar
        pedidosDB.forEach(function (pedido, index, pedidosDB) {
            //Procesar fecha/bloqueo
            if (pedido.Bloqueado === 'X')
                pedido.EstadoBloqueoReclamo = 'B';
            else if (pedido.Reclamo === 'C') {
                if (getTimeDifferenceFromNow(pedido.FechaEntrega) > 0)
                    pedido.EstadoBloqueoReclamo = 'CA';
                else
                    pedido.EstadoBloqueoReclamo = 'C';
            }
            else if (pedido.Reclamo === 'R') {
                if (getTimeDifferenceFromNow(pedido.FechaEntrega) > 0)
                    pedido.EstadoBloqueoReclamo = 'RA';
                else
                    pedido.EstadoBloqueoReclamo = 'R'
            }
            else {
                if (getTimeDifferenceFromNow(pedido.FechaEntrega) > 0)
                    pedido.EstadoBloqueoReclamo = 'A';
                else
                    pedido.EstadoBloqueoReclamo = '';
            }

            $scope.pedidos.push(pedido);
        });

        console.log($scope.pedidos);
    }

    

    $rootScope.actualizarAgenda = function () {
        $ionicLoading.show({
            template: 'Cargando...'
        });

        if($rootScope.serviceIsRunning){
            showAlert("Atencion","Hay una sincronizacion en curso. Intentar nuevamente en unos instantes.")
            $ionicLoading.hide();
        }else{

            $rootScope.endSyncroService();

            //Revisar envios pendientes
            syncManager.sendPendientes(function (msg) {
                console.log(msg);//Envio de pendientes terminado
                //Obtener clientes
                syncManager.getClientes(function (msg) {
                    console.log(msg);//Pedido de clientes terminado
                    //Obtener pedidos
                    syncManager.getPedidos(function (nuevos) {

                        if(nuevos > 0){
                            showAlert("Total Argentina", String.format("Se agregan {0} nuevos pedidos", nuevos));                            
                        }else{
                            showAlert("Total Argentina", "No hay pedidos nuevos.");
                        }
                        $scope.$apply(function () {

                            $rootScope.recuperarPedidos();

                            $rootScope.startSyncroService();

                            $ionicLoading.hide();
                        });
                    });
                });
            });
        //$ionicLoading.hide(); 
        }
    };

    ///timeToCalculate string '2015-01-23' or ISO8601
    function getTimeDifferenceFromNow(timeToCalculate) {
        var dif = 0;
        try {
            var parsedDate = timeToCalculate.substring(0, 4) + '-' + timeToCalculate.substring(4, 6) + '-' + timeToCalculate.substring(6, 8);
            var now = new moment();
            var destinationDate = moment(parsedDate);

            dif = now.diff(destinationDate);
        } catch (e) {
            console.log("Error procesando fechas");
            console.log(e.message);
            console.log(e.log);
        }
        return dif;
    }

    $scope.irADetallePedido = function (pedido) {
        //pedido.Cliente = ClientesFactory.findById(pedido.CodigoCliente);

        //Si el pedido está cancelado de alguna manera.
        if (pedido.EstadoBloqueoReclamo === 'C' || pedido.EstadoBloqueoReclamo === 'CA' || pedido.EstadoBloqueoReclamo.indexOf('C') > -1) {
            showAlert("Total Argentina", "Pedido cancelado");
        } else {
            /*
            * En este punto se evalua si el pedido est� bloqueado en cuyo caso se marca el fondo con color
            * rojo pero no se bloquea ni se mantiene en esta pantalla sino que se lo redirige al detalle de igual modo.
            * Esto hace que la l�gica de pintado sea redundante y por eso la vamos a dejar comentada.
             */
            //Marcar bloqueado
            //if (pedido.EstadoBloqueoReclamo === 'B') {
            //    //Pintar �tem de rojo
            //    pedido.EstadoBloqueoReclamoSelected = true;
            ////TODO Agregar el ng-class correspondiente junto a una clase para pintar el fondo
            ////TODO Agregar l�gica durante la carga de la agenda para limpiar este campo en todos los pedidos
            //}

            console.log(pedido);

            $state.go('app.detalleEntrega', {numeroPedido: pedido.NumeroPedido});
        }
    };

    //LOAD
    if($rootScope.previousState === 'app.home' || $rootScope.previousState === 'app.datosInicio'){
        $rootScope.actualizarAgenda();
    }
    $rootScope.recuperarPedidos();
}); 