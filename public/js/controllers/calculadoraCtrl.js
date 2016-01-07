controllerModule.controller('calculadoraCtrl', function ($scope,$stateParams,$rootScope,EntregaFactory,PedidosFactory,ClientesFactory,TIAPDAFactory,WS,$state) {

    $scope.formData = {
        txtDato : "",
        valorCalculado : "",
        precioPorLitro : "",
        neto : "",
        IVA : "",
        PIB : "",
        PI : "",
        respuesta : "",
        tipoConversion : 0
    };
    console.log($stateParams.numeroEntrega);
    $scope.entrega = EntregaFactory.findById($stateParams.numeroEntrega);
    console.log($scope.entrega);
    $scope.pedido = PedidosFactory.findById($stateParams.numeroEntrega);
    $scope.entrega.cliente = ClientesFactory.findById($scope.entrega.CodigoCliente);

    console.log($scope.entrega);
    console.log($scope.entrega.cliente);

    var TIAPDAObj = TIAPDAFactory.getElement();

    //Detección de espontáneo y bloqueado
    $scope.pedidoEspontaneo = $scope.entrega.Espontaneo != undefined && $scope.entrega.Espontaneo != null && $scope.entrega.Espontaneo == true;
    $scope.pedidoBloqueado = true;

    $scope.inputLabel = "Litros :";

    $scope.valoresLabelInput = ["Litros :","Kilos :","Pesos :","Pesos :"];
    $scope.opcionesSelect = [{valor:0,label:"Litros => Pesos"},{valor:1,label:"Kilos => Pesos"},{valor:2,label:"Pesos => Litros"},{valor:3,label:"Pesos => Kilos"}];
    $scope.formData.tipoConversion = $scope.opcionesSelect[0];
    $scope.formData.respuesta = "A pagar: $";
    $scope.formData.valorCalculado = "Litros :";

    $scope.cambioSelect = function(seleccion){
        $scope.formData.valorCalculado = $scope.valoresLabelInput[$scope.formData.tipoConversion.valor];

        switch ($scope.formData.tipoConversion.valor) {
            case 0:
                $scope.formData.respuesta = "A pagar: $";
                break;
            case 1:
                $scope.formData.respuesta = "A pagar: $";
                break;
            case 2:
                $scope.formData.respuesta = "Litros: $";
                break;
            case 3:
                $scope.formData.respuesta = "Kilos: $";
                break;
        }
    };

    function getLabelFromSelectedOption( value ) {
        for ( var i = 0 ; i < $scope.opcionesSelect.length ; i++ ) {
            if ($scope.opcionesSelect[i].valor === value) {
                return($scope.valoresLabelInput[i].label);
            }
        }
        return null;
    }

    var impuesto1 = 0;
    var impuesto2 = 0;
    var impuesto3 = 0;
    var bruto = 0;
    var neto = 0;
    var datoLitros = 0;
    var datoKilos = 0;

    $rootScope.litrosVentaEsp = "";
    $rootScope.precioVentaEsp = ""; //toString();

    $scope.volverAEntrega = function(){
        if(!$scope.pedidoEspontaneo){
            $scope.pedido.rhoItem.updateAttributes({
                Precio: $scope.entrega.PrecioUnitario
            });
        }
        $rootScope.datosCalculadora = null;
        $rootScope.goBack();
    };

    $scope.calcular = function(){

        console.log($scope.formData.txtDato);

        if(isInt($scope.formData.txtDato)){
            calculadora($scope.formData.tipoConversion.valor,$scope.pedidoEspontaneo)
        }else{
            showAlert("Atencion","El monto ingresado es inválido");
        }
    };

    function isInt(value) {
        return !isNaN(value) &&
            parseInt(Number(value)) == value &&
            !isNaN(parseInt(value, 10));
    }

    function calculadora(tipoConversion,pedidoEspontaneo){

        console.log("calculdora() "+ tipoConversion + " "+ pedidoEspontaneo );
        $scope.calculoTerminado = false;

        var dp = TIAPDAObj.DP;

        var IVA = 0;
        var PIB = 0;
        var PI = 0;
        var precio = 0;
        var tipoFactura = '';

        if(pedidoEspontaneo){
            IVA = Number($scope.entrega.cliente.IVA) / 100;
            PIB = Number($scope.entrega.cliente.PIB) / 100;
            PI = Number($scope.entrega.cliente.PI) / 100;
            precio = Number($scope.entrega.cliente.precio);

        }else{
            IVA = Number($scope.entrega.IVA) / 100;
            PIB = Number($scope.entrega.IIBB) / 100;
            PI = Number($scope.entrega.PercepcionIVA) / 100;
            console.log($scope.entrega);
            precio = Number($scope.entrega.PrecioUnitario);

            if(precio <= 0){
                precio = Number($scope.entrega.cliente.precio);
            }
        }

        console.log(PI);

        var datoIngresado = Number($scope.formData.txtDato);
        var datoIngresadoRedondeado = datoIngresado.toFixed(2);
        var densidad = Number(dp);
        var precioPedido = 0;
        var precioPedidoRedondeado = 0;
        var precioConImpuestos = 0;
        var precioConImpuestosRedondeado = 0;
        impuesto1 = 0;

        if(tipoConversion == 0){
            //CALCULOS
            var kilos = datoIngresado * densidad;
            console.log($scope.entrega);
            precioPedido = kilos * precio;

            precioPedidoRedondeado = precioPedido.toFixed(4);
            precioConImpuestos = precioPedido * (1 + IVA + PIB + PI).toFixed(4);
            precioConImpuestosRedondeado = precioConImpuestos.toFixed(4);
            impuesto1 = (precioPedido * IVA).toFixed(4); //TODO GLOBAL
            var calculoPrecioPorLitro = 0;

            if(facturaB()){
                var temp = Number(Number(impuesto1)/Number(datoIngresadoRedondeado)).toFixed(2);
                calculoPrecioPorLitro = Number(Number(precio / (1 / densidad)).toFixed(2)) + Number(temp);
            }else{
                calculoPrecioPorLitro = (precio / (1 / densidad)).toFixed(2);
            }

            //CARGA DE DATOS EN PANTALLA
            $scope.formData.valorCalculado = "Kilos: "+kilos.toFixed(2);
            $scope.formData.precioPorLitro = "$" + Number(calculoPrecioPorLitro).toFixed(2);
            $scope.formData.IVA = "$"+(precioPedido * IVA).toFixed(4)+" ("+(IVA * 100).toFixed(2)+"%)";
            $scope.formData.PIB = "$"+(precioPedido * PIB).toFixed(4)+" ("+(PIB * 100).toFixed(2)+"%)";
            $scope.formData.PI = "$"+(precioPedido * PI).toFixed(4)+" ("+(PI * 100).toFixed(2)+"%)";
            $scope.formData.neto = "$"+precioPedidoRedondeado;
            $scope.formData.respuesta = "A pagar: $" + precioConImpuestosRedondeado;

            //TODO GLOBALES
            impuesto2 = (precioPedido * PIB).toFixed(4);
            impuesto3 = (precioPedido * PI).toFixed(4);
            bruto = precioPedidoRedondeado;
            neto = precioConImpuestosRedondeado;

            datoLitros = datoIngresado;
            datoKilos = kilos.toFixed(4);
            $rootScope.litrosVentaEsp = kilos; //toString();
            $rootScope.precioVentaEsp = precioPedidoRedondeado; //toString();

            $scope.calculoTerminado = true;

        }else if (tipoConversion == 1){
            var litros = datoIngresado / densidad; //a
            precioPedido = datoIngresado * precio; //b
            precioPedidoRedondeado = precioPedido.toFixed(4);
            precioConImpuestos = precioPedido * (1 + IVA + PIB + PI).toFixed(4); //c - valorTotalCalc
            precioConImpuestosRedondeado = precioConImpuestos.toFixed(4);
            impuesto1 = (precioPedido * IVA).toFixed(4); //TODO GLOBAL

            if(facturaB()){
                calculoPrecioPorLitro = Number((precio / (1 / densidad)).toFixed(2)) + Number(Number(impuesto1)/Number(Number(datoIngresadoRedondeado)/densidad));
            }else{
                calculoPrecioPorLitro = (precio / (1 / densidad)).toFixed(2);
            }

            //CARGA DE DATOS EN PANTALLA
            $scope.formData.valorCalculado = "Litros: "+litros.toFixed(2);
            $scope.formData.precioPorLitro = "$" + Number(calculoPrecioPorLitro).toFixed(2);
            $scope.formData.IVA = "$"+(precioPedido * IVA).toFixed(4)+" ("+(IVA * 100).toFixed(2)+"%)";
            $scope.formData.PIB = "$"+(precioPedido * PIB).toFixed(4)+" ("+(PIB * 100).toFixed(2)+"%)";
            $scope.formData.PI = "$"+(precioPedido * PI).toFixed(4)+" ("+(PI * 100).toFixed(2)+"%)";
            $scope.formData.neto = "$"+precioPedidoRedondeado;
            $scope.formData.respuesta = "A pagar: $" + precioConImpuestosRedondeado;

            //TODO GLOBALES
            impuesto2 = (precioPedido * PIB).toFixed(4);
            impuesto3 = (precioPedido * PI).toFixed(4);
            bruto = precioPedidoRedondeado;
            neto = precioConImpuestosRedondeado;

            datoLitros = litros.toFixed(4);
            datoKilos = datoIngresado;
            $rootScope.litrosVentaEsp = datoIngresado; //toString();
            $rootScope.precioVentaEsp = precioPedidoRedondeado; //toString();

            $scope.calculoTerminado = true;
        }else if (tipoConversion == 2){
            var monto = datoIngresado / (1 + IVA + PIB + PI); //a
            var kilos = (monto / precio).toFixed(4); //e y c
            var litros = kilos / densidad; //b y valorTotalCalc
            var litrosRedondeado = litros.toFixed(4);
            impuesto1 = (monto * IVA).toFixed(4); //TODO GLOBAL

            if(facturaB()){
                calculoPrecioPorLitro = Number((precio / (1 / densidad)).toFixed(2)) + Number(Number(impuesto1)/Number(litros));
            }else{
                calculoPrecioPorLitro = (precio / (1 / densidad)).toFixed(2);
            }

            //CARGA DE DATOS EN PANTALLA
            $scope.formData.valorCalculado = "Kilos: "+Number(kilos).toFixed(2);
            $scope.formData.precioPorLitro = "$" + Number(calculoPrecioPorLitro).toFixed(2);
            $scope.formData.IVA = "$"+(monto * IVA).toFixed(4)+" ("+(IVA * 100).toFixed(2)+"%)";
            $scope.formData.PIB = "$"+(monto * PIB).toFixed(4)+" ("+(PIB * 100).toFixed(2)+"%)";
            $scope.formData.PI = "$"+(monto * PI).toFixed(4)+" ("+(PI * 100).toFixed(2)+"%)";
            $scope.formData.neto = "$"+monto.toFixed(4);
            $scope.formData.respuesta = "Litros: "+ litrosRedondeado;

            //TODO GLOBALES
            impuesto2 = (monto * PIB).toFixed(4);
            impuesto3 = (monto * PI).toFixed(4);
            bruto = monto.toFixed(4);
            neto = datoIngresado;

            datoLitros = litrosRedondeado;
            datoKilos = kilos;
            $rootScope.litrosVentaEsp = datoKilos;
            $rootScope.precioVentaEsp = bruto; //toString();

            $scope.calculoTerminado = true;
        }else if (tipoConversion == 3){

            var monto = datoIngresado / (1 + IVA + PIB + PI); //a
            var kilos = monto / precio; //b y valorTotalCalc
            var litros = (kilos / densidad).toFixed(2); //c
            var kilosRedondeado = kilos.toFixed(4);
            impuesto1 = (monto * IVA).toFixed(4); //TODO GLOBAL

            if(facturaB()){
                calculoPrecioPorLitro = Number(Number(Number(precio) / Number(1 / densidad)).toFixed(2)) + Number((Number(impuesto1)/Number(litros)).toFixed(2));
            }else{
                calculoPrecioPorLitro = (precio / (1 / densidad)).toFixed(2);
            }

            //CARGA DE DATOS EN PANTALLA
            $scope.formData.valorCalculado = "Litros: "+Number(litros).toFixed(2);
            $scope.formData.precioPorLitro = "$" + Number(calculoPrecioPorLitro).toFixed(2);
            $scope.formData.IVA = "$"+(monto * IVA).toFixed(4)+" ("+(IVA * 100).toFixed(2)+"%)";
            $scope.formData.PIB = "$"+(monto * PIB).toFixed(4)+" ("+(PIB * 100).toFixed(2)+"%)";
            $scope.formData.PI = "$"+(monto * PI).toFixed(4)+" ("+(PI * 100).toFixed(2)+"%)";
            $scope.formData.neto = "$"+monto.toFixed(4);
            $scope.formData.respuesta = "Kilos: "+ kilosRedondeado;

            //TODO GLOBALES
            impuesto2 = (monto * PIB).toFixed(4);
            impuesto3 = (monto * PI).toFixed(4);
            bruto = monto.toFixed(4);
            neto = datoIngresado;

            datoLitros = litros;
            datoKilos = kilosRedondeado;
            $rootScope.litrosVentaEsp = datoKilos;
            $rootScope.precioVentaEsp = bruto; //toString();

            $scope.calculoTerminado = true;
        }

        if(calculosCorrectos()){
            if($scope.entrega.EstadoBloqueoReclamo != 'B'){
                $scope.pedidoBloqueado = false;
            }else{
                showAlert("Atencion","No es posible aprobar el pedido porque el mismo está bloqueado");
            }
        }else{
            showAlert("Atencion","No es posible aprobar el pedido por errores en los cálculos. Verifique los datos ingresados.");
        }
    }

    function calculosCorrectos(){
        return $scope.calculoTerminado && $scope.formData.valorCalculado && $scope.formData.precioPorLitro && $scope.formData.IVA && $scope.formData.PIB && $scope.formData.PI && $scope.formData.neto && $scope.formData.respuesta;
    }

    $scope.aprobar = function(){
        if(isInt($scope.formData.txtDato)){

            var kg = TIAPDAObj.KG;
            var kc = TIAPDAObj.KC;

            var porcentajeLocal = PORCENTAJE;
            var sobreVenta = 0;
            var factorSobreVenta = 0;

            console.log(porcentajeLocal);

            if(porcentajeLocal == 0){
                sobreVenta = 0;
            }else{
                var factorSobreVentaSinRedondear = porcentajeLocal / 100;
                factorSobreVenta = factorSobreVentaSinRedondear.toFixed(0);
                sobreVenta = Number(kg) * factorSobreVenta;
            }

            console.log(sobreVenta);
            console.log($rootScope.litrosVentaEsp);

            var testingC = (kg + sobreVenta) - kc;

            if(testingC >= Number($rootScope.litrosVentaEsp)){
                if($scope.pedidoEspontaneo){
                    if(true){
                        //VemtaEspon = 2
                        $scope.entrega.rhoItem.updateAttributes({
                                CantidadPedida: $rootScope.litrosVentaEsp,
                                Precio: $rootScope.precioVentaEsp,
                                CodigoStatusPedido:2
                            }
                        );
                    }else{
                        //VemtaEspon = 1
                        $scope.entrega.rhoItem.updateAttributes({
                                CantidadPedida: $rootScope.litrosVentaEsp,
                                Precio: $rootScope.precioVentaEsp
                            }
                        );
                    }
                }else {
                    $scope.pedido.rhoItem.updateAttributes({
                            CantidadPedida: $rootScope.litrosVentaEsp,
                            Precio: $rootScope.precioVentaEsp
                        }
                    );
                }
                
                //Guardo datos en rootscope para que estén disponibles en la siguiente pantalla
                $rootScope.datosCalculadora = {
                    datoKilos: Number(datoKilos).toFixed(2),
                    datoLitros: Number(datoLitros).toFixed(2),
                    bruto: Number(bruto).toFixed(2),
                    impuesto1: Number(impuesto1).toFixed(2),
                    impuesto2: Number(impuesto2).toFixed(2),
                    impuesto3: Number(impuesto3).toFixed(2),
                    neto: Number(neto).toFixed(2)
                };
                

                $state.go('app.detalleEntrega',{numeroPedido:$scope.entrega.NumeroPedido});

            }else{
                var kgParaVender = testingC + sobreVenta;
                showAlert("Atencion","Solo posee "+ kgParaVender +" kg para vender");
            }
        }else{
            showAlert("Atencion","El monto ingresado es inválido");
        }
    };

    function facturaB(){
        if($scope.pedidoEspontaneo){
            return $scope.entrega.cliente.codigo_TipoCliente != '01' && $scope.entrega.cliente.codigo_TipoCliente != '02';
        }else{
            return $scope.entrega.CodigoTipoCliente != '01' && $scope.entrega.CodigoTipoCliente != '02';
        }
    }
});