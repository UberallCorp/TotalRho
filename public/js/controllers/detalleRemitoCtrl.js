/**
 * Created by Ea on 29/09/2015.
 */
controllerModule.controller('detalleRemitoCtrl', function ($scope, $stateParams, $rootScope, EntregaFactory,PagoFactory,$ionicLoading, PedidosFactory,CondicionPagoFactory, ClientesFactory, TIAPDAFactory, $state) {

        //No Menu items for this.
        //$rootScope.menuItems = [];

        $scope.entrega = EntregaFactory.findById($stateParams.numeroEntrega);
        $scope.pedido = PedidosFactory.findById($stateParams.numeroEntrega);
        $scope.numeroRemito = $stateParams.numeroRemito;
        $scope.precinto = $stateParams.precinto;
        $scope.controlCarga = $stateParams.controlCarga;
        $scope.entrega.cliente = ClientesFactory.findById($scope.entrega.CodigoCliente);

        $scope.data = {
            total: null,
            condicionPago:null
        };
        var condicionPago;
        if($scope.entrega.Espontaneo){
            condicionPago = CondicionPagoFactory.getElement($scope.entrega.cliente.condicion_Pago);
        }else{
            condicionPago = CondicionPagoFactory.getElement($scope.pedido.CondicionPago);
        }
        if(condicionPago != null || condicionPago != undefined ){
            $scope.data.condicionPago = condicionPago.Descripcion;
        }

        $scope.data.total = String.toFixed("${0}", (Number($rootScope.datosCalculadora.bruto) +
        Number($rootScope.datosCalculadora.impuesto1) +
        Number($rootScope.datosCalculadora.impuesto2) +
        Number($rootScope.datosCalculadora.impuesto3)),2);

        $scope.volver = function(){
            $scope.entrega.rhoItem.updateAttributes(
                {CodigoStatusPedido: 2}
            );
            $scope.pedido.rhoItem.updateAttributes(
                {CodigoStatusPedido: 2}
            );

            $rootScope.goBack();
        };

        $scope.btnSiguiente = function () {

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
                Precinto:$scope.precinto,
                ControlCarga:$scope.controlCarga,
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

            $state.go('app.porcentajeYObservaciones', {numeroPedido: $stateParams.numeroEntrega});
        };
    }
);