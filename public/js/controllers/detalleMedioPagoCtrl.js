controllerModule.controller('detalleMedioPagoCtrl', function ($scope,$state,$rootScope,$stateParams,$ionicLoading,BancoFactory,TipoMedioPagoFactory,TIAPDAFactory,EntregaFactory,PedidosFactory,PagoFactory) {

    $scope.entrega = EntregaFactory.findById($stateParams.numeroEntrega);
    $scope.pedido = PedidosFactory.findById($stateParams.numeroEntrega);
    $scope.codigoMedioPago = $stateParams.codigoMedioPago;

    $scope.segundoMedioDePago = false;
    $scope.otro = "";
    $scope.tituloCobranza = "";

    $scope.pagoParcial = false;

    $scope.forms = {};
    $scope.formularioActivo = null;

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

    switch (Number($scope.codigoMedioPago)) {
        case 1://Efectivo
            $scope.titulo = "Efectivo";
            break;
        case 2://Cheque
            $scope.titulo = "Cheque";
            $scope.bancos = BancoFactory.getAll();
            console.log($scope.bancos);
            $scope.tiposMedioPago = TipoMedioPagoFactory.getTiposPorMedioPago($scope.codigoMedioPago);
            break;
        case 3://Tarjeta
            $scope.titulo = "Tarjeta";
            $scope.tiposMedioPago = TipoMedioPagoFactory.getTiposPorMedioPago($scope.codigoMedioPago);
            break;
        case 5://Cuenta Corriente
            $scope.titulo = "Cuenta Corriente";
            break;
        default :
            $scope.titulo = "F. Retención";
            $scope.tiposMedioPago = TipoMedioPagoFactory.getTiposPorMedioPago($scope.codigoMedioPago);
            break;
    }

    $scope.volver = function(){
        $scope.entrega.rhoItem.updateAttributes(
            {CodigoStatusPedido: 2}
        );
        $scope.pedido.rhoItem.updateAttributes(
            {CodigoStatusPedido: 2}
        );
        $rootScope.goBack();
    };

    $scope.ingresar = function(){

        var fechaActual = new moment().format("YYYYMMDD");
        var horaActual =  new moment().format("HHmmss");

        //CARGO DATOS PAGO
        switch (Number($scope.codigoMedioPago)) {
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

            //Geolocalizar();

            if(Number($scope.datosPago.monto) > Number($rootScope.datosCalculadora.neto).toFixed(2)){
                showAlert("Error","El monto no es menor o igual al pago total.");
            }else{
                //if($scope.datosPago.monto < $rootScope.datosCalculadora.neto){
                //    $scope.pagoParcial = true;
                //}

                if($scope.pedido){
                    $scope.pedido.rhoItem.updateAttributes({
                        CodigoStatusPedido:3,
                        CantidadVendida:$rootScope.datosCalculadora.datoKilos,
                        Latitud:  $rootScope.posicionGPSActual.latitud,
                        Longitud:  $rootScope.posicionGPSActual.longitud
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
                    Latitud:  $rootScope.posicionGPSActual.latitud,
                    Longitud:  $rootScope.posicionGPSActual.longitud
                });

                if(Number($scope.datosPago.monto) < Number($rootScope.datosCalculadora.neto).toFixed(2)){
                    var montoRestante = (Number($rootScope.datosCalculadora.neto).toFixed(2) - Number($scope.datosPago.monto)).toFixed(2);

                    var pagosAnteriores = PagoFactory.getByNumeroPedido($scope.entrega.NumeroPedido);

                    if(pagosAnteriores.length > 0){
                        for(i = 0;i < pagosAnteriores.length; i++){
                            if(pagosAnteriores[i].transaccion === '3'){
                                pagosAnteriores[i].rhoItem.updateAttributes({
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
                            }
                        }
                    }else{
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
                    }

                    $state.go('app.otroMedioPago',{numeroEntrega:$scope.entrega.NumeroPedido, montoRestante:montoRestante});

                }else{
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
                    //if(HAY CONEXION){ TODO EVALUAR SI ES NECESARIO CHEQUEAR POR CONEXION EN ESTE PUNTO E INFORMAR QUE SI NO HAY CONEXION SE ENVIARÁ LA VENTA LUEGO.


                    $state.go('app.porcentajeYObservaciones', {numeroPedido: $stateParams.numeroEntrega});
                }
            }
        }else{
            angular.forEach($scope.formularioActivo.$error.required, function(field) {
                field.$setDirty();
            });
        }
    };
});