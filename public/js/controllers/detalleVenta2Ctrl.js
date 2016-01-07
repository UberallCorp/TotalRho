/**
 * Created by lbriglio on 30/07/2015.
 */

controllerModule.controller('detalleVenta2Ctrl', function ($scope, $stateParams, $rootScope, EntregaFactory, PedidosFactory, ClientesFactory, TIAPDAFactory, WS, $state) {

    //No Menu items for this.
    //$rootScope.menuItems = [];

    //Esta funcion se utiliza para la carga inicial de data. 
    function load(nroPedido, tipoDoc, pesoNeto){
        $scope.entrega = EntregaFactory.findById(nroPedido);
        $scope.pedido = PedidosFactory.findById(nroPedido);

        $scope.tipoDoc = tipoDoc;

        $scope.entrega.rhoItem.updateAttributes({
                TipoDocumento: tipoDoc
            }
        );

        $scope.forms = {};
        $scope.error = 0;


        $scope.codigoClienteSeis = true;

        $scope.frmDetalleVenta2 = {
            descripcionTipoDoc: null,
            neto: String.toFixed("${0}", pesoNeto, 2),
            sumatoriaVR: null,
            remitoLitros: null,
            facturaALitros: '',
            facturaANeto: '',
            facturaAIVA: '',
            facturaAPrecioIVA: '',
            facturaAIIBB: '',
            facturaASumatoria: '',
            facturaATotal: '',

            facturaBLitros: '',
            facturaBNeto: '',
            facturaBIIBB: '',
            facturaBSumatoria: '',
            facturaBTotal: '',
            facturaBTotalConfirmacion: ''
        };    
    }

    //Si vengo en el workflow normal entonces debería tener datos en los parámetros.
    //Pero si vengo de un Back entonces no voy a tener esos datos y si los paso por parámetro
    //Es como si se fuera para adelante entonces varios back romperían el workflow de la app.
    if($rootScope.previousState === 'app.ingresoFacturaMPago'){
        load($rootScope.nroPedido, $rootScope.tipoDoc, $rootScope.pesoNeto);
    }else{
        load($stateParams.numeroEntrega, $stateParams.tipoDoc, $stateParams.neto);
    }

    

    loadForm();

    function loadForm() {
        switch (Number($scope.tipoDoc)) {

            case 1://Factura A
                $scope.frmDetalleVenta2.descripcionTipoDoc = "Factura A";

                $scope.frmDetalleVenta2.facturaATotal = String.toFixed("{0}",$rootScope.datosCalculadora.neto,2);

                break;
            case 2://Factura B
                $scope.frmDetalleVenta2.descripcionTipoDoc = "Factura B";

                $scope.frmDetalleVenta2.facturaBTotal = String.toFixed("{0}",$rootScope.datosCalculadora.neto,2);

                if ($scope.entrega.CodigoTipoCliente === '06') {

                    $scope.frmDetalleVenta2.sumatoriavr = Number($rootScope.datosCalculadora.impuesto1) +
                    Number($rootScope.datosCalculadora.impuesto3);

                } else {
                }

                break;
            case 3://Remito
                $scope.frmDetalleVenta2.descripcionTipoDoc = "Remito";
                break;

        }
    }

    $scope.get_total = function(){
        return (Number($scope.frmDetalleVenta2.facturaANeto) + Number($scope.frmDetalleVenta2.facturaAIVA) + Number($scope.frmDetalleVenta2.facturaAPrecioIVA) + Number($scope.frmDetalleVenta2.facturaAIIBB)).toFixed(2);
    }

    $scope.get_total_B = function(){
        return (Number($scope.frmDetalleVenta2.facturaBNeto) + Number($scope.frmDetalleVenta2.facturaBIIBB)).toFixed(2);
    }

    $scope.btnVolver_click = function () {
        //TODO Revisar si hay m�s logica que tenga que ver con el flujo de los espont�neos
        $rootScope.goBack();
    };

    $scope.btnSiguiente_click = function () {
        //variableComparacionIngreso = 0;

        var error = false;

        $scope.error = 0;

        switch (Number($scope.tipoDoc)) {
            case 1://Factura A
                //validar litros
                if(($scope.frmDetalleVenta2.facturaALitros.toString().length > 0)){
                    if (!error && isNaN($scope.frmDetalleVenta2.facturaALitros)) {
                        error = true;
                        $scope.error = 1;
                        showAlert("Error", "Debe ingresar los litros");
                    } else {
                        if (!error && Number($scope.frmDetalleVenta2.facturaALitros) != Number($rootScope.datosCalculadora.datoLitros)) {
                            error = true;
                            $scope.error = 1;
                            showAlert("Error", "No concuerda la cantidad ingresada");
                        }
                    }                    
                }else{
                    error = true;
                    $scope.error = 1;
                    showAlert("Error", "Debe ingresar los litros");
                }
                //Validar bruto
                if(($scope.frmDetalleVenta2.facturaANeto.toString().length > 0)){
                    if (!error && isNaN($scope.frmDetalleVenta2.facturaANeto)) {
                        error = true;
                        $scope.error = 2;
                        showAlert("Error", "Debe ingresar el Neto");
                    } else {
                        if (!error && Number($scope.frmDetalleVenta2.facturaANeto) != Number($rootScope.datosCalculadora.bruto)) {
                            error = true;
                            $scope.error = 2;
                            showAlert("Error", "No concuerda el valor Neto.");
                        }
                    }                    
                }else{
                    error = true;
                    $scope.error = 2;
                    showAlert("Error", "Debe ingresar el Neto");
                }
                //Validar Impuesto 1
                if(($scope.frmDetalleVenta2.facturaAIVA.toString().length > 0)){
                    if (!error && isNaN($scope.frmDetalleVenta2.facturaAIVA)) {
                        error = true;
                        $scope.error = 3;
                        showAlert("Error", "Debe ingresar el IVA");
                    } else {
                        if (!error && Number($scope.frmDetalleVenta2.facturaAIVA) != Number($rootScope.datosCalculadora.impuesto1)) {
                            error = true;
                            $scope.error = 3;
                            showAlert("Error", "No concuerda el IVA.");
                        }
                    }                    
                }else{
                    error = true;
                    $scope.error = 3;
                    showAlert("Error", "Debe ingresar el IVA");
                }
                //Validar impuesto 2
                if(($scope.frmDetalleVenta2.facturaAPrecioIVA.toString().length > 0)){
                    if (!error && isNaN($scope.frmDetalleVenta2.facturaAPrecioIVA)) {
                        error = true;
                        $scope.error = 4;
                        showAlert("Error", "Debe ingresar el Per. IVA");
                    } else {
                        if (!error && Number($scope.frmDetalleVenta2.facturaAPrecioIVA) != Number($rootScope.datosCalculadora.impuesto3)) {
                            error = true;
                            $scope.error = 4;
                            showAlert("Error", "No concuerda el valor de Per. IVA.");
                        }
                    }                    
                }else{
                    error = true;
                    $scope.error = 4;
                    showAlert("Error", "Debe ingresar el Per. IVA");
                }
                //Validar IMpuesto 3
                if(($scope.frmDetalleVenta2.facturaAIIBB.toString().length > 0)){

                    if (!error && isNaN($scope.frmDetalleVenta2.facturaAIIBB)) {
                        error = true;
                        $scope.error = 5;
                        showAlert("Error", "Debe ingresar los IIBB");
                    } else {
                        if (!error && Number($scope.frmDetalleVenta2.facturaAIIBB) != Number($rootScope.datosCalculadora.impuesto2)) {
                            error = true;
                            $scope.error = 5;
                            showAlert("Error", "No concuerda el valor IIBB.");
                        }
                    }                    
                }else{
                    error = true;
                    $scope.error = 5;
                    showAlert("Error", "Debe ingresar los IIBB");
                }

                if (!error) {
                    $state.go('app.ingresoFacturaMPago', {
                        numeroPedido: $scope.entrega.NumeroPedido
                    });
                }

                break;
            case 2://Factura B
                //validar litros
                if(($scope.frmDetalleVenta2.facturaBLitros.toString().length > 0)){
                    if (!error && isNaN($scope.frmDetalleVenta2.facturaBLitros)) {
                        error = true;
                        $scope.error = 6;
                        showAlert("Error", "Debe ingresar los litros");
                    } else {
                        if (!error && Number($scope.frmDetalleVenta2.facturaBLitros) != Number($rootScope.datosCalculadora.datoLitros)) {
                            error = true;
                            $scope.error = 6;
                            showAlert("Error", "No concuerda la cantidad ingresada");
                        }
                    }                    
                }else{
                    error = true;
                    $scope.error = 6;
                    showAlert("Error", "Debe ingresar los litros");
                }

                if ($scope.entrega.CodigoTipoCliente === '06') {
                    //Validar neto
                    if(($scope.frmDetalleVenta2.facturaBNeto.toString().length > 0)){
                        if (!error && isNaN($scope.frmDetalleVenta2.facturaBNeto)) {
                            error = true;
                            $scope.error = 7;
                            showAlert("Error", "Debe ingresar el neto");
                        } else {
                            if (!error && Number($scope.frmDetalleVenta2.facturaBNeto) != (Number($rootScope.datosCalculadora.bruto
                                ) + Number($rootScope.datosCalculadora.impuesto1))) {
                                error = true;
                                $scope.error = 7;
                                showAlert("Error", "No concuerda el valor neto");
                            }
                        }                        
                    }
                    else{
                        error = true;
                        $scope.error = 7;
                        showAlert("Error", "Debe ingresar el neto");
                    }
                    //Validar IMpuesto 2
                    if(($scope.frmDetalleVenta2.facturaBIIBB.toString().length > 0)){
                        if (!error && isNaN($scope.frmDetalleVenta2.facturaBIIBB)) {
                            error = true;
                            $scope.error = 8;
                            showAlert("Error", "Debe ingresar los IIBB");
                        } else {
                            if (!error && Number($scope.frmDetalleVenta2.facturaBIIBB) != Number($rootScope.datosCalculadora.impuesto2)) {
                                error = true;
                                $scope.error = 8;
                                showAlert("Error", "No concuerda el valor IIBB.");
                            }
                        }                 
                    }else{
                        error = true;
                        $scope.error = 8;
                        showAlert("Error", "Debe ingresar los IIBB");
                    }
                }else{
                    //Validar neto confirmacion
                    if(($scope.frmDetalleVenta2.facturaBTotalConfirmacion.toString().length > 0)){
                        if (!error && isNaN($scope.frmDetalleVenta2.facturaBTotalConfirmacion)) {
                            error = true;
                            $scope.error = 9;
                            showAlert("Error", "Debe ingresar el neto");
                        } else {
                            //var valorAComparar = Number($rootScope.datosCalculadora.neto) + Number($rootScope.datosCalculadora.impuesto1);
                            var valoresDistintos = Number($scope.frmDetalleVenta2.facturaBTotalConfirmacion).toFixed(2) != Number($rootScope.datosCalculadora.neto).toFixed(2);
                            if (!error && valoresDistintos) {
                                error = true;
                                $scope.error = 9;
                                showAlert("Error", "No concuerda el valor neto");
                            }
                        }                        
                    }else{
                        error = true;
                        $scope.error = 9;
                        showAlert("Error", "Debe ingresar el neto");
                    }
                }
                if (!error) {
                    $state.go('app.ingresoFacturaMPago', {
                        numeroPedido: $scope.entrega.NumeroPedido
                    });
                }
                break;
            case 3://Remito
                //validar litros
                if (isNaN($scope.frmDetalleVenta2.remitoLitros)) {
                    $scope.error = 10;
                    showAlert("Error", "Debe ingresar los litros");
                } else {
                    if (Number($scope.frmDetalleVenta2.remitoLitros) == Number($rootScope.datosCalculadora.datoLitros)) {
                        $state.go('app.ingresoFacturaMPago', {
                            numeroPedido: $scope.entrega.NumeroPedido
                        });
                    } else {
                        $scope.error = 10;
                        showAlert("Error", "No concuerda la cantidad");
                    }
                }


                break;
        }

    };


});