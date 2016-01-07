controllerModule.controller('detalleMedioPagoCobranzaCtrl', function ($scope,$state,$rootScope,ClientesFactory,$stateParams,$ionicLoading,BancoFactory,MedioPagoFactory,TipoMedioPagoFactory,TIAPDAFactory,EntregaFactory,PedidosFactory,PagoFactory) {

    //$scope.entrega = EntregaFactory.findById($stateParams.numeroEntrega);
    //$scope.pedido = PedidosFactory.findById($stateParams.numeroEntrega);
    //$scope.codigoMedioPago = $stateParams.codigoMedioPago;

    $scope.numRecibo = $rootScope.numeroRecibo;
    $scope.numPedidoEsp = $rootScope.numPedidoEsp;
    $scope.cliente = ClientesFactory.findById($rootScope.idCliente);

    $scope.mediosDePago = MedioPagoFactory.getAll();
    $scope.segundoMedioDePago = true;
    $scope.otro = "";
    $scope.tituloCobranza = " Cobranza";

    $scope.pagoParcial = false;

    $scope.forms = {};
    $scope.formularioActivo = null;

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
        monto:""
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

        $scope.datosPago = {
            banco: '0',
            fechaVencimiento: "",
            codigoAutorizacion: "",
            cuotas: "",
            cupon: "",
            tipo:'0',
            numeroIdentificador: '',
            monto:""
        };

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
        $rootScope.goBack();
    };

    $scope.ingresar = function(){

        var fechaActual = new moment().format("YYYYMMDD");
        var horaActual =  new moment().format("HHmmss");

        var codigo = Number($scope.formSeleccionSegundoMedioPago.codigoMedioPago);
        if(codigo > 0){

            //CARGO DATOS PAGO
            switch (codigo) {
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

                var pagoElement = PagoFactory.create({
                    Transaccion: '4',
                    NumeroPedido: $scope.numRecibo,
                    CodigoCliente: $scope.cliente.codigoCliente,
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
                    Fecha: fechaActual,
                    Hora: horaActual,
                    Estado: '0',
                    Enviado:'0'
                });

                //if(HAY CONEXION){ TODO EVALUAR SI ES NECESARIO CHEQUEAR POR CONEXION EN ESTE PUNTO E INFORMAR QUE SI NO HAY CONEXION SE ENVIARÁ LA VENTA LUEGO.
                $ionicLoading.show({
                    template: 'Cargando...'
                });

                syncManager.sendPendientes(function(result){
                    $ionicLoading.hide();

                    if(result == "Todo procesado"){
                        showAlert("Exito","Pago Finalizado.");
                    }else{
                        showAlert("Error","Hubo un problema cerrando la venta. Se intentará nuevamente en la próxima sincronización.");
                    }

                    $state.go('app.agenda');
                });
                //}

            }else{
                angular.forEach($scope.formularioActivo.$error.required, function(field) {
                    field.$setDirty();
                });
            }
        }else{
            showAlert('TotalArgentina', 'Debe seleccionar un medio de pago');
        }
    };
});