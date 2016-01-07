controllerModule.controller('detalleEntregaCtrl', function ($scope,$stateParams,$rootScope,PedidosFactory,ClientesFactory,EntregaFactory,TIAPDAFactory,$state, CondicionPagoFactory) {
    //ON LOAD INIT
    //No Menu items for this.
    //$rootScope.menuItems = [];

    $scope.pedido = EntregaFactory.findById($stateParams.numeroPedido);

    $scope.pedidoEspontaneo = false;
    $scope.cancelarStatus = false;

    $scope.sit = {
        pedida: false,
        valor: 0
    };

    $scope.form = {
        mostrarRemito:false
    };

    //Detección de espontáneo
    if($scope.pedido != null && $scope.pedido != undefined && $scope.pedido.Espontaneo != null && $scope.pedido.Espontaneo != undefined && $scope.pedido.Espontaneo == true){
        //Hay unicamente entrega (espontaneo)
        $scope.pedido.cliente = ClientesFactory.findById($scope.pedido.CodigoCliente);
        $scope.pedidoEspontaneo = true;
        $scope.cancelarStatus = true;
        var CondicionPago = CondicionPagoFactory.getElement($scope.pedido.CondicionPago);
        if(CondicionPago != null){
            $scope.pedido.cliente.condicion_Pago = CondicionPago.Descripcion;            
        }
        var pedidosEsp = EntregaFactory.getEspNotSent();
        if(pedidosEsp.length <= 0 && $scope.pedido.cliente == null){
            showAlert('Total Argentina', 'No hay pedidos registrados');
        }
    }else{
        //Hay pedido y puede haber o no entrega.
        $scope.pedido = PedidosFactory.findById($stateParams.numeroPedido);
        $scope.pedido.cliente = ClientesFactory.findById($scope.pedido.CodigoCliente);

        var CondicionPago = CondicionPagoFactory.getElement($scope.pedido.CondicionPago);
        if(CondicionPago != null && $scope.pedido.cliente != null){
            $scope.pedido.cliente.condicion_Pago = CondicionPago.Descripcion;            
        }

        console.log($scope.pedido);

        if($scope.pedido == null){
            showAlert('Total Argentina', 'No hay pedidos registrados');
        }

        //Carga de CheckBox "Solicitud de Inspección Técnica"
        $scope.sit.pedida = ($scope.pedido.SIT != undefined && $scope.pedido.SIT != 0);

        if($scope.pedido.EstadoBloqueoReclamo == 'B'){
            showAlert("ATENCION","PEDIDO BLOQUEADO - NO ABASTECER");
        }
    }

    //Carga de campo Tipo Factura
    if($scope.pedido.Espontaneo == true){
        if($scope.pedido.cliente.codigo_TipoCliente == '01' || $scope.pedido.cliente.codigo_TipoCliente == '02'){
            $scope.pedido.TipoFactura = 'Factura A';
        }else{
            $scope.pedido.TipoFactura = 'Factura B';
        }
        if($scope.pedido.cliente.autorizacion == 'R'){
            $scope.form.mostrarRemito = true;
        }
    }
    else{
        if($scope.pedido.CodigoTipoCliente == '01' || $scope.pedido.CodigoTipoCliente == '02'){
            $scope.pedido.TipoFactura = 'Factura A';
        }else{
            $scope.pedido.TipoFactura = 'Factura B';
        }
        if($scope.pedido.Autorizacion == 'R'){
            $scope.form.mostrarRemito = true;
        }
    }

    

    var TIAPDAObj = TIAPDAFactory.getElement();
    $rootScope.densidad = 0.51;

    var litrosGas = 0;

    // Se decidió no utilizar la variable global densidad y obtener la densidad unicamente de TIAPDA. Además se detectó que litrosGas no se usa para nada en esta pantalla.
    litrosGas = $scope.pedido.CantidadPedida / TIAPDAObj.DP;

    //ON LOAD FINISH

    $scope.siguienteDetalleEntrega = function(){

        if($rootScope.datosCalculadora) {
            $state.go('app.detalleVenta', {numeroEntrega: $scope.pedido.NumeroPedido});
        }else{
            var cliente = $scope.pedido.cliente;

            if(!$scope.pedidoEspontaneo){
                var entregaYaRealizada = EntregaFactory.findById($scope.pedido.NumeroPedido);

                console.log(entregaYaRealizada);

                if(entregaYaRealizada != null && entregaYaRealizada != undefined){
                    entregaYaRealizada.rhoItem.destroy();
                }

                if($scope.sit.pedida){
                    $scope.sit.valor = 1;
                }else{
                    $scope.sit.valor = 0;
                }

                $scope.pedido.rhoItem.updateAttributes(
                    {'SIT' : $scope.sit.valor}
                );

                var entregaElement = EntregaFactory.create({
                    'Sector': $scope.pedido.Codigo_Sector,
                    'CodigoStatusPedido': '2',
                    'NumeroPedido': $scope.pedido.NumeroPedido,
                    'CodigoCliente': $scope.pedido.Codigo_Cliente,
                    'NombreCliente': $scope.pedido.Nombre_Cliente,
                    'NombreDestinatario': $scope.pedido.Nombre_Destinatario,
                    'DireccionDestinatario': $scope.pedido.Direccion_Destinatario,
                    'Bloqueado': 'N',
                    'Estado':0,
                    'CondicionPago': $scope.pedido.Cond_Pago,
                    'Region': $scope.pedido.Region,
                    'Localidad': $scope.pedido.Localidad,
                    'IVA': $scope.pedido.IVA,
                    'PercepcionIVA': $scope.pedido.Percep_IVA,
                    'IIBB': $scope.pedido.IIBB,
                    'Zona': $scope.pedido.Zona,
                    'Espontaneo': false,
                    'Enviado':0,
                    'SIT': $scope.sit.valor,
                    'Precio': $scope.pedido.Precio,
                    'PrecioUnitario': $scope.pedido.Precio,
                    'CodigoTipoCliente': $scope.pedido.CodigoTipoCliente
                });
            }
            if($scope.pedidoEspontaneo){
                GeoReferenciaCliente(cliente);
            }

            $state.go('app.calculadora',{numeroEntrega:$scope.pedido.NumeroPedido});
        }
    };

    $scope.cancelarPedido = function(){
        $state.go('app.cancelacionPedido',{numeroPedido:$scope.pedido.NumeroPedido});
    };

    function GeoReferenciaCliente(cliente){
        if(!cliente.latitud || !cliente.longitud){
            showConfirm("Geolocalización",
                "El cliente no esta GeoReferenciado desea configurarle la ubicación actual?",
                "Cancelar",
                "Geolocalizar",
                function (){
                    cliente.rhoItem.updateAttributes(
                        {Latitud:$rootScope.posicionGPSActual.latitud,
                        Longitud:$rootScope.posicionGPSActual.longitud}
                    );

                    var fechaActual = new moment().format("MM/DD/YYYY");
                    var horaActual =  new moment().format("HH:mm:ss");

                    var datosUsuario = syncManager.getDatosUsuario();

                    //crear una entrada a un cliente
                    GPSFactory.create({
                        'Id': GPSFactory.getNewId(),
                        'Cliente': cliente.codigoCliente,
                        'Enviado': 0,
                        'Fecha': fechaActual + " " + horaActual,
                        //'HR': ntr,
                        'Latitud': $rootScope.posicionGPSActual.latitud,
                        'Longitud': $rootScope.posicionGPSActual.longitud,
                        'UUID': datosUsuario.idpda  //TODO CHEQUEAR QUE ESTE GUARDADO
                    });

                    //syncManager.updateGPS() TODO este método falta (envía posiciones de HR y de Clientes que queden por mandar).
                }
            );
        }
    }
});