/**
 * Created by lbriglio on 29/07/2015.
 */
controllerModule.controller('detalleVentaCtrl', function ($scope, $stateParams, $rootScope, EntregaFactory, PedidosFactory, ClientesFactory, TIAPDAFactory, WS, $state) {

        //No Menu items for this.
        //$rootScope.menuItems = [];

        $scope.entrega = EntregaFactory.findById($stateParams.numeroEntrega);
        $scope.pedido = PedidosFactory.findById($stateParams.numeroEntrega);
        $scope.entrega.cliente = ClientesFactory.findById($scope.entrega.CodigoCliente);

        $scope.frmDetalleVenta = {
            docEntregaSeleccionado: null,
            kg: null,
            litros: null,
            precioKilo: null,
            precioLitro: null,
            importe: null,
            neto: null,
            iva: null,
            precioIVA: null,
            iibb: null,
            total: null
        };

        $scope.panelVisible = null;

        var tipoCliente;
        var autorizacion;

        var docsEntrega = [];
        docsEntrega.push({descripcion: 'Factura A', ind_docEntrega: 1});
        docsEntrega.push({descripcion: 'Factura B', ind_docEntrega: 2});
        docsEntrega.push({descripcion: 'Remito', ind_docEntrega: 3});

        var docsEntregaHabilitados = [];

        //Poner script para ver que tipo de cliente es
        if ($scope.entrega.Espontaneo) {
            tipoCliente = $scope.entrega.cliente.codigo_TipoCliente;
            autorizacion = $scope.entrega.cliente.autorizacion;
        } else {
            tipoCliente = $scope.pedido.CodigoTipoCliente;
            autorizacion = $scope.pedido.Autorizacion;
        }

        autorizacion = autorizacion ? autorizacion.toUpperCase() : "";

        if (tipoCliente === "01" || tipoCliente === "02") {
            if (autorizacion === "F")
                docsEntregaHabilitados.push(docsEntrega[0]);
            else if (autorizacion === "R")
                docsEntregaHabilitados.push(docsEntrega[2]);
            else {
                docsEntregaHabilitados.push(docsEntrega[0]);
                docsEntregaHabilitados.push(docsEntrega[2]);
            }
        }

        if (tipoCliente === "04" || tipoCliente === "05" || tipoCliente === "06" || tipoCliente === "07") {
            if (autorizacion === "F")
                docsEntregaHabilitados.push(docsEntrega[1]);
            else if (autorizacion === "R")
                docsEntregaHabilitados.push(docsEntrega[2]);
            else {
                docsEntregaHabilitados.push(docsEntrega[1]);
                docsEntregaHabilitados.push(docsEntrega[2]);
            }
        }

        $scope.docsEntrega = docsEntregaHabilitados;
        $scope.frmDetalleVenta.docEntregaSeleccionado = docsEntregaHabilitados[0].ind_docEntrega;
        evaluarTipoDoc();

        $scope.btnSiguiente = function () {
            $rootScope.tipoDoc = $scope.frmDetalleVenta.docEntregaSeleccionado;
            $rootScope.pesoNeto = $scope.frmDetalleVenta.neto;
            $rootScope.nroPedido = $scope.entrega.NumeroPedido;
            
            $state.go('app.detalleVenta2', {
                numeroEntrega: $scope.entrega.NumeroPedido,
                tipoDoc: $scope.frmDetalleVenta.docEntregaSeleccionado,
                neto: $scope.frmDetalleVenta.neto
            });
        };

        $scope.btnVolver = function () {
            //TODO Revisar si hay m�s logica que tenga que ver con el flujo de los espont�neos
            $rootScope.goBack();
        };

        $scope.docEntregaChange = function (ev) {
            evaluarTipoDoc();
        };

        function evaluarTipoDoc() {
            $scope.panelVisible = $scope.frmDetalleVenta.docEntregaSeleccionado;

            switch ($scope.frmDetalleVenta.docEntregaSeleccionado) {
                case 1://Factura A
                    $scope.frmDetalleVenta.precioKilo = String.toFixed("${0}", $scope.entrega.PrecioUnitario,4);
                    $scope.frmDetalleVenta.precioLitro = String.toFixed("${0}", Number($scope.entrega.PrecioUnitario) * 0.51,4);
                    $scope.frmDetalleVenta.kg = String.toFixed("{0}",$rootScope.datosCalculadora.datoKilos,2);
                    $scope.frmDetalleVenta.litros =String.toFixed("{0}",$rootScope.datosCalculadora.datoLitros,2);
                    $scope.frmDetalleVenta.neto = String.toFixed("${0}", $rootScope.datosCalculadora.bruto,2);
                    $scope.frmDetalleVenta.importe = String.toFixed("${0}", $rootScope.datosCalculadora.bruto,2);
                    $scope.frmDetalleVenta.iva = String.toFixed("${0}", $rootScope.datosCalculadora.impuesto1,2);
                    $scope.frmDetalleVenta.iibb = String.toFixed("${0}", $rootScope.datosCalculadora.impuesto2,2);
                    $scope.frmDetalleVenta.precioIVA = String.toFixed("${0}", $rootScope.datosCalculadora.impuesto3,2);
                    $scope.frmDetalleVenta.total = String.toFixed("${0}", (Number($rootScope.datosCalculadora.bruto) +
                    Number($rootScope.datosCalculadora.impuesto1) +
                    Number($rootScope.datosCalculadora.impuesto2) +
                    Number($rootScope.datosCalculadora.impuesto3)),2);

                    //GUARDAR NETO
                    calcularNeto();

                    break;
                case 2://Factura B
                    $scope.frmDetalleVenta.precioKilo = String.toFixed("${0}", Number($scope.entrega.PrecioUnitario) +
                    (Number($rootScope.datosCalculadora.impuesto1)/Number($rootScope.datosCalculadora.datoKilos))
                        ,4);
                    $scope.frmDetalleVenta.precioLitro = String.toFixed("${0}", (Number($scope.entrega.PrecioUnitario) * 0.51) +
                        (Number($rootScope.datosCalculadora.impuesto1)/Number($rootScope.datosCalculadora.datoLitros))
                        ,4);
                    $scope.frmDetalleVenta.kg = String.toFixed("{0}",$rootScope.datosCalculadora.datoKilos,2);
                    $scope.frmDetalleVenta.litros =String.toFixed("{0}",$rootScope.datosCalculadora.datoLitros,2);
                    $scope.frmDetalleVenta.importe = String.toFixed("${0}", 0,2);
                    $scope.frmDetalleVenta.neto = String.toFixed("${0}", 0,2);
                    $scope.frmDetalleVenta.iva = String.toFixed("${0}", 0,2);
                    $scope.frmDetalleVenta.precioIVA = String.toFixed("${0}", 0,2);
                    $scope.frmDetalleVenta.iibb = String.toFixed("${0}", 0,2);
                    $scope.frmDetalleVenta.total = String.toFixed("${0}", (Number($rootScope.datosCalculadora.bruto) +
                    Number($rootScope.datosCalculadora.impuesto1) +
                    Number($rootScope.datosCalculadora.impuesto2) +
                    Number($rootScope.datosCalculadora.impuesto3)),2);

                    if($scope.entrega.CodigoTipoCliente === '06'){
                        $scope.frmDetalleVenta.iibb = String.toFixed("${0}", $rootScope.datosCalculadora.impuesto2,2);
                        $scope.frmDetalleVenta.neto = String.toFixed("${0}", Number($rootScope.datosCalculadora.bruto)+
                            Number($rootScope.datosCalculadora.impuesto1)
                            ,2);
                    }

                    //GUARDAR NETO
                    calcularNeto();
                    break;

                case 3://Remito
                    $scope.frmDetalleVenta.kg = String.toFixed("{0}",$rootScope.datosCalculadora.datoKilos,2);
                    $scope.frmDetalleVenta.litros = String.toFixed("{0}",$rootScope.datosCalculadora.datoLitros,2);

                    break;
            }

            function calcularNeto(){
                $rootScope.datosCalculadora.neto = (Number($rootScope.datosCalculadora.bruto) +
                Number($rootScope.datosCalculadora.impuesto1) +
                Number($rootScope.datosCalculadora.impuesto2) +
                Number($rootScope.datosCalculadora.impuesto3));
            }
        }
    }
);