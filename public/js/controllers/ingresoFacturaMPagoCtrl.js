controllerModule.controller('ingresoFacturaMPagoCtrl', function ($scope,$state,$rootScope, MedioPagoFactory,$stateParams, EntregaFactory, PedidosFactory,$ionicLoading,PagoFactory,TIAPDAFactory, ClientesFactory) {

    $scope.entrega = EntregaFactory.findById($stateParams.numeroPedido);
    $scope.pedido = PedidosFactory.findById($stateParams.numeroPedido);
    if($scope.entrega.Espontaneo){
        $scope.cliente = ClientesFactory.findById($scope.entrega.CodigoCliente);
    }

    console.log($scope.entrega);

    $scope.formSubmitted = false;

    $scope.mediosDePago = MedioPagoFactory.getAll();

    $scope.datosForm={
        factura1:"",
        factura2:"",
        precinto:"",
        controlCarga:"",
        codigoMedioPago:""
    };

    $scope.forms = {};

    $scope.facturaORemito = "";
    $scope.tipoFacturaORemito = "";
    $scope.showMedioPago = true;

    switch(Number($scope.entrega.TipoDocumento)) {
        case 1:
            $scope.facturaORemito = "Factura";
            $scope.tipoFacturaORemito = "A";
            break;
        case 2:
            $scope.facturaORemito = "Factura";
            $scope.tipoFacturaORemito = "B";
            break;
        case 3:
            $scope.facturaORemito = "Remito";
            $scope.tipoFacturaORemito = "R";
            $scope.showMedioPago=false;
            break;
    }

    $scope.volver = function(){
        $scope.entrega.rhoItem.updateAttributes(
            {CodigoStatusPedido: 2}
        );

        $state.go('app.detalleVenta2',{numeroEntrega:Number($stateParams.numeroPedido),tipoDoc:Number($scope.entrega.TipoDocumento),neto:0});
    };

    $scope.siguiente = function(){

        $scope.formSubmitted = false;
        var numbers = new RegExp(/^[0-9]+$/);

        if(!(numbers.test($scope.datosForm.factura1) && numbers.test($scope.datosForm.factura2))){
            $scope.formSubmitted = true;
        }

        if($scope.forms.formFacturaMPago.$valid && numbers.test($scope.datosForm.factura1) && numbers.test($scope.datosForm.factura2)){
            if($scope.facturaORemito == "Remito"){
                $scope.numeroRemito = $scope.datosForm.factura1+$scope.tipoFacturaORemito+$scope.datosForm.factura2;

                var entregas = EntregaFactory.findByNumeroDocumento($scope.numeroRemito);

                if(entregas.length <= 0){
                    $scope.entrega.rhoItem.updateAttributes(
                        {CodigoStatusPedido: 3}
                    );
                    if($scope.pedido !== null && $scope.pedido !== 'undefined'){
                        $scope.pedido.rhoItem.updateAttributes(
                            {CodigoStatusPedido: 3}
                        );
                    }
                    //Si es un pedido Espontaneo la Autorizacion está en el cliente sino en el pedido.
                    var autorizacion = '';
                    if($scope.entrega.Espontaneo){
                        autorizacion = $scope.cliente.autorizacion;
                    }else{
                        autorizacion = $scope.pedido.Autorizacion;
                    }

                    if(autorizacion === 'R'){
                        //Si Tiene Autorizacion de Remito entonces voy a la pantalla de Remito.
                        $state.go('app.detalleRemito',{numeroEntrega:$scope.entrega.NumeroPedido,numeroRemito:$scope.numeroRemito,precinto:$scope.datosForm.precinto,controlCarga:$scope.datosForm.controlCarga});
                    }else{
                        //Sino tiene Autorizacion de Remito entonces tengo que generar todo el cierre aca e ir a Porcentaje de Carga.
                        if($scope.entrega.Espontaneo != undefined && $scope.entrega.Espontaneo != null && $scope.entrega.Espontaneo){
                            $scope.entrega.rhoItem.updateAttributes({
                                    CantidadPedida: $rootScope.datosCalculadora.datoKilos,
                                    Latitud: $rootScope.posicionGPSActual.latitud,
                                    Longitud: $rootScope.posicionGPSActual.longitud
                                }
                            );
                        }else{
                            $scope.entrega.rhoItem.updateAttributes({
                                    CantidadPedida: $rootScope.datosCalculadora.datoKilos,
                                    Latitud: $rootScope.posicionGPSActual.latitud,
                                    Longitud: $rootScope.posicionGPSActual.longitud
                                }
                            );

                            if($scope.pedido){
                                $scope.pedido.rhoItem.updateAttributes({
                                        CantidadPedida: $rootScope.datosCalculadora.datoKilos,
                                        CodigoStatusPedido:3
                                    }
                                );
                            }
                        }

                        var fechaActual = new moment().format("YYYYMMDD");
                        var horaActual =  new moment().format("HHmmss");

                        $scope.entrega.rhoItem.updateAttributes({
                            TipoVenta:"1",
                            FechaEntrega:fechaActual,
                            CodigoProducto:"",
                            CantidadVendida:$rootScope.datosCalculadora.datoKilos,
                            PrecioUnitario:$scope.entrega.Precio,
                            IVA:$rootScope.datosCalculadora.impuesto1,
                            IIBB:$rootScope.datosCalculadora.impuesto2,
                            PI:$rootScope.datosCalculadora.impuesto3,
                            PrecioTotal:$rootScope.datosCalculadora.neto,
                            Estado: "1",
                            FechaEnv:horaActual,
                            NumeroDocumento:$scope.numeroRemito,
                            Precinto:$scope.datosForm.precinto,
                            ControlCarga:$scope.datosForm.controlCarga,
                            Latitud: $rootScope.posicionGPSActual.latitud,
                            Longitud: $rootScope.posicionGPSActual.longitud
                        });

                        var pagoElement = PagoFactory.create({
                            Transaccion: '3',
                            NumeroPedido: $scope.entrega.NumeroPedido,
                            CodigoCliente: $scope.entrega.CodigoCliente,
                            CentroAbastecedor: '',
                            MedioPago: '5',
                            Monto: '0',
                            NumeroIdentificador: '',
                            Tipo: '0',
                            Banco: '0',
                            FechaVencimiento: "",
                            CodigoAutorizacion: "",
                            Cuotas: "",
                            Cupon: "",
                            Estado: '0',
                            Enviado:'0'
                        });

                        //ACTUALIZAMOS CANTIDAD DE KILOS VENDIDOS
                        var TIAPDAObj = TIAPDAFactory.getHash();

                        var kilosActualizados = Number(TIAPDAObj.KC) + Number($rootScope.datosCalculadora.datoKilos);

                        TIAPDAObj.rhoItem.updateAttributes({
                                KC: kilosActualizados
                            }
                        );
                        $state.go('app.porcentajeYObservaciones', {numeroPedido: $stateParams.numeroPedido});
                    }
                }else{
                    showAlert("Atención","El número de "+$scope.facturaORemito+" ingresado ya fue enviado.");
                }
            }else{
                //$rootScope.codigoMedioPago = $scope.datosForm.codigoMedioPago;
                $rootScope.datosFactura = {};
                $rootScope.datosFactura.precinto = $scope.datosForm.precinto;
                $rootScope.datosFactura.controlCarga = $scope.datosForm.controlCarga;

                //$scope.entrega.NumeroDocumento = $scope.datosForm.factura1+$scope.tipoFacturaORemito+$scope.datosForm.factura2;

                $scope.entrega.rhoItem.updateAttributes({
                        NumeroDocumento: $scope.datosForm.factura1+$scope.tipoFacturaORemito+$scope.datosForm.factura2
                    }
                );

                $state.go('app.detalleMedioPago',{numeroEntrega:$scope.entrega.NumeroPedido, codigoMedioPago: $scope.datosForm.codigoMedioPago});
            }
        }else{
            angular.forEach($scope.forms.formFacturaMPago.$error.required, function(field) {
                field.$setDirty();
            });

            showAlert("Atención","Verifique los campos del formulario.")
        }
    }

});