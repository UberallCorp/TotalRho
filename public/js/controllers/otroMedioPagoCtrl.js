controllerModule.controller('otroMedioPagoCtrl', function ($scope,$state,$rootScope,$stateParams,$ionicLoading,BancoFactory,TipoMedioPagoFactory,MedioPagoFactory,TIAPDAFactory,EntregaFactory,PedidosFactory,PagoFactory) {

    $scope.entrega = EntregaFactory.findById($stateParams.numeroEntrega);
    $scope.pedido = PedidosFactory.findById($stateParams.numeroEntrega);

    $scope.montoRestante = $stateParams.montoRestante;
    $scope.segundoMedioDePago = true;
    $scope.mediosDePago = MedioPagoFactory.getAll();

    $scope.pagoParcial = false;

    $scope.forms = {};
    $scope.formularioActivo = null;

    $scope.otro = "Otro ";
    $scope.tituloCobranza = "";
    $scope.codigoMedioPago = "";
    $scope.formSeleccionSegundoMedioPago = {
        codigoMedioPago:""
    };

    $scope.fechaChequeInvalida = false;
    $scope.datosCheque = {
        numero:"",
        codigoBanco:0,
        diaVenc:"",
        mesVenc:"",
        anioVenc:"",
        tipoMedioPago:0
    };
    $scope.datosTarjeta = {
        tipoMedioPago:0,
        codAut:"",
        cuotas:0,
        numeroCupon:""
    };

    $scope.datosPago = {
        banco: '0',
        fechaVencimiento: "",
        codigoAutorizacion: "",
        cuotas: "",
        cupon: "",
        tipo:'0',
        numeroIdentificador: '',
        monto:'0'
    };

    $scope.datosRetencion = {
        numero:"",
        tipoMedioPago:0
    };

    $scope.titulo = "";

    $scope.seleccionMedioDePago = function() {
        $ionicLoading.show({
            template: 'Cargando...'
        });

        var codigo = Number($scope.formSeleccionSegundoMedioPago.codigoMedioPago);

        switch (codigo) {
            case 1://Efectivo
                $scope.titulo = "Efectivo";
                break;
            case 2://Cheque
                $scope.titulo = "Cheque";
                $scope.bancos = BancoFactory.getAll();
                console.log($scope.bancos);
                $scope.tiposMedioPago = TipoMedioPagoFactory.getTiposPorMedioPago(codigo);
                break;
            case 3://Tarjeta
                $scope.titulo = "Tarjeta";
                $scope.tiposMedioPago = TipoMedioPagoFactory.getTiposPorMedioPago(codigo);
                break;
            case 5://Cuenta Corriente
                $scope.titulo = "Cuenta Corriente";
                break;
            default :
                $scope.titulo = "F. Retención";
                $scope.tiposMedioPago = TipoMedioPagoFactory.getTiposPorMedioPago(codigo);
                break;
        }
        $scope.codigoMedioPago = codigo;

        $ionicLoading.hide();
    };

    $scope.volver = function(){

    };

    $scope.ingresar = function(){

        var fechaActual = new moment().format("YYYYMMDD");
        var horaActual =  new moment().format("HHmmss");

        //CARGO DATOS PAGO
        switch (Number($scope.formSeleccionSegundoMedioPago.codigoMedioPago)) {
            case 1://Efectivo
                $scope.formularioActivo = $scope.forms.formEfectivo;
                break;
            case 2://Cheque
                $scope.fechaChequeInvalida = false;

                $scope.formularioActivo = $scope.forms.formCheque;
                $scope.datosPago.banco = $scope.datosCheque.codigoBanco;
                $scope.datosPago.numeroIdentificador = $scope.datosCheque.numero;
                $scope.datosPago.tipo = $scope.datosCheque.tipoMedioPago;
                //TODO Ver validación fecha.

                if($scope.datosCheque.diaVenc == "" ||  $scope.datosCheque.mesVenc == "" || $scope.datosCheque.anioVenc == ""){
                    $scope.fechaChequeInvalida = true;
                }

                $scope.datosPago.fechaVencimiento = $scope.datosCheque.diaVenc + "/" + $scope.datosCheque.mesVenc + "/" + $scope.datosCheque.anioVenc;
                break;
            case 3://Tarjeta
                $scope.formularioActivo = $scope.forms.formTarjeta;
                $scope.datosPago.tipo = $scope.datosTarjeta.tipoMedioPago;
                $scope.datosPago.codigoAutorizacion = $scope.datosTarjeta.codAut;
                $scope.datosPago.cuotas = $scope.datosTarjeta.cuotas;
                $scope.datosPago.cupon = $scope.datosTarjeta.numeroCupon;
                break;
            case 5://Cuenta Corriente
                $scope.formularioActivo = $scope.forms.formCuentaCorriente;
                break;
            default :
                $scope.formularioActivo = $scope.forms.formRetencion;
                $scope.datosPago.numeroIdentificador = $scope.datosRetencion.numero;
                $scope.datosPago.tipo = $scope.datosRetencion.tipoMedioPago;
                break;
        }

        if($scope.formularioActivo.$valid){
            if(Number($scope.datosPago.monto).toFixed(2) != Number($scope.montoRestante).toFixed(2)){
                showAlert("Error","Monto inválido. Se debe completar el monto total.");
            }else{

                //Geolocalizar();

                if($scope.pedido){
                    $scope.pedido.rhoItem.updateAttributes({
                        CodigoStatusPedido:3,
                        CantidadVendida:$rootScope.datosCalculadora.datoKilos,
                        Latitud: $rootScope.posicionGPSActual.latitud,
                        Longitud: $rootScope.posicionGPSActual.longitud
                    });
                }

                $scope.entrega.rhoItem.updateAttributes({
                    TipoVenta:"1",
                    FechaEntrega:fechaActual,
                    CodigoProducto:"",
                    CodigoStatusPedido:3,
                    CantidadVendida:$rootScope.datosCalculadora.datoKilos,
                    PrecioUnitario:$scope.entrega.Precio,
                    IVA:$rootScope.datosCalculadora.impuesto1,
                    IIBB:$rootScope.datosCalculadora.impuesto2,
                    PI:$rootScope.datosCalculadora.impuesto3,
                    PrecioTotal:$rootScope.datosCalculadora.neto,
                    Estado: "0",
                    FechaEnv:horaActual,
                    Precinto:$rootScope.datosFactura.precinto,
                    ControlCarga:$rootScope.datosFactura.controlCarga,
                    Latitud: $rootScope.posicionGPSActual.latitud,
                    Longitud: $rootScope.posicionGPSActual.longitud
                });

                var pagoElement = PagoFactory.create({
                    Transaccion: '3',
                    NumeroPedido: $scope.entrega.NumeroPedido,
                    CodigoCliente: $scope.entrega.CodigoCliente,
                    CentroAbastecedor: '',
                    MedioPago: $scope.codigoMedioPago,
                    Monto: $scope.datosPago.monto,
                    NumeroIdentificador: $scope.datosPago.numeroIdentificador,
                    Tipo: $scope.datosPago.tipo,
                    Banco: $scope.datosPago.banco,
                    FechaVencimiento: $scope.datosPago.fechaVencimiento,
                    CodigoAutorizacion: $scope.datosPago.codigoAutorizacion,
                    Cuotas: $scope.datosPago.cuotas,
                    Cupon: $scope.datosPago.cupon,
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

                $rootScope.datosCalculadora = null;



                $state.go('app.porcentajeYObservaciones', {numeroPedido: $stateParams.numeroEntrega});

                //if(HAY CONEXION){ TODO EVALUAR SI ES NECESARIO CHEQUEAR POR CONEXION EN ESTE PUNTO E INFORMAR QUE SI NO HAY CONEXION SE ENVIARÁ LA VENTA LUEGO.
//                $ionicLoading.show({
//                    template: 'Cargando...'
//                });
//                syncManager.sendPendientes(function(result){
//                    $ionicLoading.hide();
//
//                    if(result == "Todo procesado"){
//                        showAlert("Exito","Venta finalizada.");
//                    }else{
//                        showAlert("Error","Hubo un problema cerrando la venta. Se intentará nuevamente en la próxima sincronización.");
//                    }
//
//                    $state.go('app.agenda');
//                });
                //}
            }
        }else{
            angular.forEach($scope.formularioActivo.$error.required, function(field) {
                field.$setDirty();
            });
        }
    };
});