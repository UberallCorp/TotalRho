/**
 * Created by Ea on 20/01/2015.
 */

//$(document).bind("mobileinit", function () {
//    $.mobile.ajaxEnabled = false;
//    $.mobile.linkBindingEnabled = false;
//    $.mobile.hashListeningEnabled = false;
//    $.mobile.pushStateEnabled = false;
//});
var appModule = angular.module("TotalApp", ['ui.router', 'controllerModule', 'ionic', 'factoriesModule']);

appModule.run(function ($rootScope, $state, $interval, $ionicLoading,$ionicPlatform,
                        PedidosFactory, ClientesFactory, TIAPDAFactory, UDFactory, GPSFactory, EntregaFactory,
                        MovimientoFactory, CargaFactory, PagoFactory, PlantaFactory, DatosServiciosFactory, MedioPagoFactory,
                        BancoFactory, MotivoFactory, RegionFactory, TipoMedioPagoFactory, CondicionPagoFactory, ConfigPantallaFactory) {
//    $rootScope.pageTitle = "Bienvenido!";
    try{
        temp = Rho.System.getPlatform();
        if(temp == "ANDROID"){
            Rho.KeyCapture.captureKey(false, "4", "");
        }
    }
    catch(e){
        console.log(e);
    }

    $rootScope.goBack = function () {
        window.history.back();
    };

    console.log(GPSFactory);

    $ionicPlatform.registerBackButtonAction(function(e){

        console.log("BACK CAPTURED");

        if($state.current.name == 'app.agenda'){
            e.preventDefault();
            $state.go('app.home');
            //$rootScope.goBack($state.current.name);
        }
    }, 600);

    $rootScope.serviceIsRunning = false;
    $rootScope.previousState;
    $rootScope.currentState;

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
    });

    $rootScope.densidad = 10;   //TODO Definir donde se ponen estas variables globales
    $rootScope.litrosVentaEsp = null;
    $rootScope.precioVentaEsp = null;

    PedidosFactory.loadAll();
    ClientesFactory.loadAll();

    $rootScope.baseURL = "http://mcl.total.com.ar/totalgaz_uat_har/sitio/servicios/services.aspx?";

    //TODO: To be removed or relocated.
    if (!(TIAPDAFactory.getAll().length > 0)) {
        var item = TIAPDAFactory.create({Estado: '0', ID: '1'});
    }
    if (!(PlantaFactory.getAll().length > 0)) {
        cargarPlantas(PlantaFactory);
    }
    if (MedioPagoFactory.getAll().length <= 0) {
        MedioPagoFactory.create({CodigoMedioPago: '1', Descripcion: 'EFECTIVO', Estado: '1'});
        MedioPagoFactory.create({CodigoMedioPago: '2', Descripcion: 'CHEQUE', Estado: '1'});
        MedioPagoFactory.create({CodigoMedioPago: '3', Descripcion: 'TARJETA DE CREDITO', Estado: '1'});
        MedioPagoFactory.create({CodigoMedioPago: '4', Descripcion: 'RETENCION IIBB', Estado: '1'});
        MedioPagoFactory.create({CodigoMedioPago: '5', Descripcion: 'CUENTA CORRIENTE', Estado: '1'});
        MedioPagoFactory.create({CodigoMedioPago: '6', Descripcion: 'RET. IMP. A LAS GANAN.', Estado: '1'});
        MedioPagoFactory.create({CodigoMedioPago: '7', Descripcion: 'RENTENCION IVA', Estado: '1'});
        MedioPagoFactory.create({CodigoMedioPago: '8', Descripcion: 'RET. TASAS SEG/HIGIENE', Estado: '1'});
        MedioPagoFactory.create({CodigoMedioPago: '9', Descripcion: 'RET. IMP. A LOS SELLOS', Estado: '1'});
    }
    if (BancoFactory.getAll().length <= 0) {
        cargarBancos(BancoFactory);
    }
    if (MotivoFactory.getAll().length <= 0) {
        cargarMotivos(MotivoFactory);
    }
    if (RegionFactory.getAll().length <= 0) {
        cargarRegiones(RegionFactory);
    }
    if (TipoMedioPagoFactory.getAll().length <= 0) {
        cargarTiposMedioPago(TipoMedioPagoFactory);
    }
    if (CondicionPagoFactory.getAll().length <= 0) {
        cargarCondicionesDePago(CondicionPagoFactory);
    }


    if (!(DatosServiciosFactory.getAll().length > 0)) {
        var elem = {
            ID: '1',
            IpServer: 'mcl.total.com.ar/totalgaz_uat_har',
            AdminAllow: 'admintotal',
            Porcentaje: '10',
            Carpeta: '/sitio/servicios'
        };

        DatosServiciosFactory.create(elem);
    }
    configs.ipServidor = DatosServiciosFactory.getElement().IpServer;

    //Loading Factories to Manager
    syncManager.setup({
        PedidosFactory: PedidosFactory,
        ClientesFactory: ClientesFactory,
        GPSFactory: GPSFactory,
        TIAPDAFactory: TIAPDAFactory,
        UDFactory: UDFactory,
        CargaFactory: CargaFactory,
        MovimientoFactory: MovimientoFactory,
        EntregaFactory: EntregaFactory,
        PagoFactory: PagoFactory,
        PlantaFactory: PlantaFactory,
        TipoMedioPagoFactory: TipoMedioPagoFactory,
        MotivoFactory: MotivoFactory,
        rootScope: $rootScope,
        state: $state
    }); 

    $rootScope.syncAll = function () {
        console.log("** Comienzo Sincro Automatica **");

        $rootScope.serviceIsRunning = true;

        //Revisar envios pendientes
        syncManager.sendPendientes(function (msg) {
            console.log(msg);//Envio de pendientes terminado
            //Obtener clientes
            syncManager.getClientes(function (msg) {
                console.log(msg);//Pedido de clientes terminado
                //Obtener pedidos
                syncManager.getPedidos(function (msg) {

                    syncManager.testGPS(function (msg) {

                        $rootScope.serviceIsRunning = false;

                        console.log("** Fin Sincro Automatica **");
                    });
                });
            });
        });
    };

    $rootScope.startSyncroService = function () {
        $rootScope.interval = $interval(function(){
            $rootScope.syncAll();}, 120000);
        console.log("** Sincro Automatica Activada**");
    };

    $rootScope.endSyncroService = function(){
        console.log("** Sincro Automatica Desactivada**");
        $interval.cancel($rootScope.interval);
    };

    $rootScope.posicionGPSActual = {
        latitud:"0",
        longitud:"0"
    };

    $rootScope.startGPSService = function () {
        $rootScope.interval = $interval(function(){
            GPSFactory.iniciarCapturaGPS();}, 20000);
        console.log("** Sincro GPS Automatica Activada**");
    };

    $rootScope.endGPSService = function(){
        GPSFactory.detenerGPS();
        console.log("** Sincro GPS Automatica Desactivada**");
    };

    //Se encarga de las configuraciones de pantalla
    $rootScope.configPantalla = function(fontSizeParam, contrastTypeParam){
        var sheet = document.createElement('style');
        var fontSize = '';
        var contrast = '';
        switch(Number(fontSizeParam)){
            case 1:
                fontSize = "ion-content, ion-content span, ion-content div, ion-content input, ion-content h3{font-size:10px !important}";
                break;
            case 2:
                fontSize = "ion-content, ion-content span, ion-content div, ion-content input, ion-content h3{font-size:16px !important}";
                break;
            case 3:
                fontSize = "ion-content, ion-content span, ion-content div, ion-content input, ion-content h3{font-size:18px !important}";
                break;
        }
        switch(Number(contrastTypeParam)){
            case 1:
                contrast = 'yellow';
                break;
            case 2:
                contrast =  'gray';
                break;
            case 3:
                contrast: 'white';
                break;
        }
        sheet.innerHTML = fontSize;
        console.log(fontSize);
        document.body.appendChild(sheet);
    }

    if(ConfigPantallaFactory.getConfig() == null){
        ConfigPantallaFactory.create({FontSize:'2', Contrast:'2'});
        $rootScope.configPantalla(2,2);
    }else{
        var item = ConfigPantallaFactory.getConfig();
        console.log(item.FontSize);
        $rootScope.configPantalla(item.FontSize, item.Contrast);
    }
});

appModule.config(function ($stateProvider, $urlRouterProvider, $locationProvider,$ionicConfigProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/app/home');

    //LogglyLoggerProvider.inputToken( '802a1011-f5f6-489e-9d74-ce43a81c11aa' ).sendConsoleErrors(true).includeTimestamp( true );

    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $ionicConfigProvider.views.forwardCache(false);
    $ionicConfigProvider.views.maxCache(0);

    $stateProvider.
        state('app', {
            url: '/app',
            abstract: true,
            cache: false,
            templateUrl: 'pages/menu.html',
            controller: 'menuCtrl'
        }).
        state('app.home', {
            url: '/home',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'pages/login.html',
                    controller: 'loginCtrl'
                }
            }
        }).
        state('app.agenda', {
            url: '/agenda',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'pages/agenda.html',
                    controller: 'agendaCtrl'
                }
            }
        }).
        state('app.detalleEntrega', {
            url: '/detalleEntrega/:numeroPedido',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'pages/detalleEntrega.html',
                    controller: 'detalleEntregaCtrl'
                }
            }
        }).
        state('app.calculadora', {
            url: '/calculadora/:numeroEntrega',
            views: {
                'menuContent': {
                    templateUrl: 'pages/calculadora.html',
                    controller: 'calculadoraCtrl'
                }
            }
        }).
        state('app.detalleVenta', {
            url: '/detalleVenta/:numeroEntrega',
            views: {
                'menuContent': {
                    templateUrl: 'pages/detalleVenta.html',
                    controller: 'detalleVentaCtrl'
                }
            }
        }).
        state('app.detalleVenta2', {
            url: '/detalleVenta2/:numeroEntrega:tipoDoc:neto',
            views: {
                'menuContent': {
                    templateUrl: 'pages/detalleVenta2.html',
                    controller: 'detalleVenta2Ctrl'
                }
            }
        }).
        state('app.detalleRemito', {
            url: '/detalleRemito/:numeroEntrega:numeroRemito:precinto:controlCarga',
            views: {
                'menuContent': {
                    templateUrl: 'pages/detalleRemito.html',
                    controller: 'detalleRemitoCtrl'
                }
            }
        }).
        state('app.descarga', {
            url: '/descarga',
            views: {
                'menuContent': {
                    templateUrl: 'pages/descarga.html',
                    controller: 'descargaCtrl'
                }
            }
        }).
        state('app.datosInicio', {
            url: '/datosInicio',
            views: {
                'menuContent': {
                    templateUrl: 'pages/datosInicio.html',
                    controller: 'datosInicioCtrl'
                }
            }
        }).
        state('app.cierreHR', {
            url: '/cierre',
            views: {
                'menuContent': {
                    templateUrl: 'pages/datosInicio.html',
                    controller: 'CierreHrCtrl'
                }
            }
        }).
        state('app.configuracion', {
            url: '/configuracion',
            views: {
                'menuContent': {
                    templateUrl: 'pages/config.html',
                    controller: 'configCtrl'
                }
            }
        }).
        state('app.recarga', {
            url: "/recarga",
            views: {
                'menuContent': {
                    templateUrl: 'pages/recarga.html',
                    controller: 'recargaController'
                }
            }
        }).
        state('app.seleccionClienteCobranza', {
            url: '/seleccionClienteCobranza',
            views: {
                'menuContent': {
                    templateUrl: 'pages/seleccionClienteEspontanea.html',
                    controller: 'seleccionClienteCobranzaCtrl'
                }
            }
        }).
        state('app.reciboCobranza', {
            url: '/reciboCobranza/:idCliente:numPedidoEsp',
            views: {
                'menuContent': {
                    templateUrl: 'pages/reciboCobranza.html',
                    controller: 'reciboCobranzaCtrl'
                }
            }
        }).
        state('app.detalleMedioPagoCobranza', {
            url: '/detalleMedioPagoCobranza/:idCliente:numPedidoEsp:numRecibo',
            views: {
                'menuContent': {
                    templateUrl: 'pages/detalleMedioPago.html',
                    controller: 'detalleMedioPagoCobranzaCtrl'
                }
            }
        }).
        state('app.ingresoFacturaMPago', {
            url: '/ingresoFacturaMPago/:numeroPedido',
            views: {
                'menuContent': {
                    templateUrl: 'pages/ingresoFacturaMPago.html',
                    controller: 'ingresoFacturaMPagoCtrl'
                }
            }
        }).
        state('app.detalleMedioPago', {
            url: '/detalleMedioPago/:numeroEntrega:codigoMedioPago',
            views: {
                'menuContent': {
                    templateUrl: 'pages/detalleMedioPago.html',
                    controller: 'detalleMedioPagoCtrl'
                }
            }
        }).
        state('app.otroMedioPago', {
            url: '/otroMedioPago/:numeroEntrega:montoRestante',
            views: {
                'menuContent': {
                    templateUrl: 'pages/detalleMedioPago.html',
                    controller: 'otroMedioPagoCtrl'
                }
            }
        }).
        state('app.seleccionCliente', {
            url: '/seleccionCliente',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'pages/seleccionClienteEspontanea.html',
                    controller: 'seleccionClienteController'
                }
            }
        }).
        state('app.cancelacionPedido', {
            url: '/cancelacionPedido:numeroPedido',
            views: {
                'menuContent': {
                    templateUrl: 'pages/cancelacionPedido.html',
                    controller: 'cancelacionPedidoCtrl'
                }
            }
        }).state('app.porcentajeYObservaciones',{
            url:'/procentajeYObservaciones:numeroPedido',
            views:{
                'menuContent':{
                    templateUrl:'pages/porcentajeDeCarga.html',
                    controller:'porcentajeYObservacionesCtrl'
                }
            }
        }).state('app.configEstilos',{
            url:'/configEstilos',
            views:{
                'menuContent': {
                    templateUrl:'pages/configEstilos.html',
                    controller:'configEstilosCtrl'
                }
            }
        });
});

function cargarBancos(factory) {
    factory.create({
        Codigo: '0',
        Descripcion: 'SIN BANCO',
        Estado: '1',
        FechaCreadion: '2010-06-23 18:07:59.347',
        Id: '1'
    });
    factory.create({
        Codigo: '295',
        Descripcion: 'AMERICAN EXPRESS',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.377',
        Id: '1'
    });
    factory.create({
        Codigo: '147',
        Descripcion: 'B I CREDITANSTALT',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.377',
        Id: '1'
    });
    factory.create({
        Codigo: '340',
        Descripcion: 'BACS CREDITO Y SECUR',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.377',
        Id: '1'
    });
    factory.create({
        Codigo: '262',
        Descripcion: 'BANK OF AMERICA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '018',
        Descripcion: 'BANK OF TOKYO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '017',
        Descripcion: 'BBVA  FRANCES',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '426',
        Descripcion: 'BICA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '266',
        Descripcion: 'BNP PARIBAS - 266',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '336',
        Descripcion: 'BRADESCO ARG',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '331',
        Descripcion: 'CETELEM ARG',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '016',
        Descripcion: 'CITIBANK',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '029',
        Descripcion: 'CIUDAD DE BS.AS.',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '319',
        Descripcion: 'CMF',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '389',
        Descripcion: 'COLUMBIA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '299',
        Descripcion: 'COMAFI',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '191',
        Descripcion: 'CREDICCOOP',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '094',
        Descripcion: 'DE CORRIENTES',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '315',
        Descripcion: 'DE FORMOSA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '093',
        Descripcion: 'DE LA PAMPA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '45',
        Descripcion: 'DE SAN JUAN',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '332',
        Descripcion: 'DE SERV. FINANCIEROS',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '338',
        Descripcion: 'DE SERV. Y TRANSAC.',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.397',
        Id: '1'
    });
    factory.create({
        Codigo: '086',
        Descripcion: 'DE STA CRUZ',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '198',
        Descripcion: 'DE VALORES',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '083',
        Descripcion: 'DEL CHUBUT',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '310',
        Descripcion: 'DEL SOL',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '060',
        Descripcion: 'DEL TUCUMAN',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '325',
        Descripcion: 'DEUTSCHE BANK',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '46',
        Descripcion: 'DO BRASIL',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '303',
        Descripcion: 'FINANSUR',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '007',
        Descripcion: 'GALICIA Y BS AS',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '044',
        Descripcion: 'HIPOTECARIO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '150',
        Descripcion: 'HSBC ARG.',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '322',
        Descripcion: 'INDUSTRIAL',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '300',
        Descripcion: 'INVERSION Y COM. EXT.',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '259',
        Descripcion: 'ITAU',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '165',
        Descripcion: 'JPMORGAN CHASE BANK',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '305',
        Descripcion: 'JULIO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '285',
        Descripcion: 'MACRO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '254',
        Descripcion: 'MARIVA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '341',
        Descripcion: 'MASVENTAS',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '312',
        Descripcion: 'MBA LAZARD BCO DE INV.',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '281',
        Descripcion: 'MERIDIAN',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '065',
        Descripcion: 'MUNICIP. ROSARIO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.407',
        Id: '1'
    });
    factory.create({
        Codigo: '011',
        Descripcion: 'NACION ARGENTINA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '386',
        Descripcion: 'NVO BCO DE ENTRE RIOS',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '309',
        Descripcion: 'NVO BCO DE LA RIOJA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '330',
        Descripcion: 'NVO BCO DE STA FE',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '311',
        Descripcion: 'NVO BCO DEL CHACO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '034',
        Descripcion: 'PATAGONIA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '301',
        Descripcion: 'PIANO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '306',
        Descripcion: 'PRIVADO DE INVERS.',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '097',
        Descripcion: 'PROV NEUQU�N',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '268',
        Descripcion: 'PROV T. DEL FUEGO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '020',
        Descripcion: 'PROV. DE CORDOBA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '014',
        Descripcion: 'PROVINCIA BS.AS.',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '339',
        Descripcion: 'RCI BANQUE',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '269',
        Descripcion: 'REP. O. DEL URUGUAY',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '247',
        Descripcion: 'ROELA',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '005',
        Descripcion: 'ROYAL BANK SCOTLAND',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '277',
        Descripcion: 'SAENZ',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '072',
        Descripcion: 'SANTANDER RIO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '321',
        Descripcion: 'SANTIAGO DEL ESTERO',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '19460',
        Descripcion: 'SOFAX',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '015',
        Descripcion: 'STANDARD BANK',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '027',
        Descripcion: 'SUPERVIELLE',
        Estado: '1',
        FechaCreadion: '2013-04-19 13:31:37.417',
        Id: '1'
    });
    factory.create({
        Codigo: '99',
        Descripcion: 'Seleccione...',
        Estado: '1',
        FechaCreadion: '2010-06-24 10:48:46.860',
        Id: '0'
    });
}

function cargarMotivos(factory) {
    factory.create({
        Id: '83',
        Descripcion: 'Sin disponibilidad económica'
    });
    factory.create({
        Id: '47',
        Descripcion: 'A Reprogramar'
    });
    factory.create({
        Id: '57',
        Descripcion: 'Sin acceso al lugar'
    });
    factory.create({
        Id: '55',
        Descripcion: 'Cambio de titular comodato'
    });
    factory.create({
        Id: '54',
        Descripcion: 'Instalacion defectuosa'
    });
    factory.create({
        Id: '53',
        Descripcion: 'Tanque lleno'
    });
    factory.create({
        Id: '52',
        Descripcion: 'Compro producto a otra empresa'
    });
    factory.create({
        Id: '50',
        Descripcion: 'Cliente no acepta'
    });
    factory.create({
        Id: '48',
        Descripcion: 'Cliente no está'
    });
}

function cargarPlantas(factory) {
    factory.create({
        Codigo: 'L256',
        Descripcion: 'Pl. Santo Tomé-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '1'
    });
    factory.create({
        Codigo: 'L257',
        Descripcion: 'Dep. San Lorenzo-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '2'
    });
    factory.create({
        Codigo: 'L258',
        Descripcion: 'Pl. Mar del Plata-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '3'
    });
    factory.create({
        Codigo: 'L259',
        Descripcion: 'Pl. Lujan de Cuyo-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '4'
    });
    factory.create({
        Codigo: 'L260',
        Descripcion: 'Pl. Resistencia-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '5'
    });
    factory.create({
        Codigo: 'L262',
        Descripcion: 'Pl. Luis Guillon-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '6'
    });
    factory.create({
        Codigo: 'L263',
        Descripcion: 'Pl. La Rioja-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '7'
    });
    factory.create({
        Codigo: 'L264',
        Descripcion: 'Pl. Cordoba-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '8'
    });
    factory.create({
        Codigo: 'L266',
        Descripcion: 'Dep. Venado Tuerto-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '9'
    });
    factory.create({
        Codigo: 'L267',
        Descripcion: 'Pl. Bahia Blanca-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '10'
    });
    factory.create({
        Codigo: 'L269',
        Descripcion: 'Pl. Río Cuarto-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '11'
    });
    factory.create({
        Codigo: 'L274',
        Descripcion: 'Dep. San Francisco-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '12'
    });
    factory.create({
        Codigo: 'T142',
        Descripcion: '3ro.Punta Alta',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '13'
    });
    factory.create({
        Codigo: 'T144',
        Descripcion: '3ro.Mar del Plata',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '14'
    });
    factory.create({
        Codigo: 'W131',
        Descripcion: '3ro.Extrag.Concordia',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '15'
    });
    factory.create({
        Codigo: 'W132',
        Descripcion: 'Pl. San Rafael-GRN',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '16'
    });
    factory.create({
        Codigo: 'W133',
        Descripcion: '3ro.Paraná',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '17'
    });
    factory.create({
        Codigo: 'W134',
        Descripcion: '3ro.C.del Uruguay',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '18'
    });
    factory.create({
        Codigo: 'W135',
        Descripcion: '3ro.Centenario',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '19'
    });
    factory.create({
        Codigo: 'W136',
        Descripcion: '3ro.Bariloche',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '20'
    });
    factory.create({
        Codigo: 'W137',
        Descripcion: '3ro.Pilar',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '21'
    });
    factory.create({
        Codigo: 'W138',
        Descripcion: '3ro.Amarilla Tandil',
        Tipo: '1',
        Estado: '3',
        Ind_Planta: '22'
    });
    factory.create({
        Codigo: '0000',
        Descripcion: 'Seleccione',
        Tipo: '1',
        Estado: '1',
        Ind_Planta: '0'
    });

}

function cargarRegiones(factory) {
    factory.create({
        Codigo: '0',
        Id: '1',
        Descripcion: 'Capital Federal',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.943',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '1',
        Id: '2',
        Descripcion: 'Buenos Aires',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.943',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '2',
        Id: '3',
        Descripcion: 'Catamarca',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.943',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '3',
        Id: '4',
        Descripcion: 'Córdoba',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '4',
        Id: '5',
        Descripcion: 'Corrientes',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '5',
        Id: '6',
        Descripcion: 'Entre Rios',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '6',
        Id: '7',
        Descripcion: 'Jujuy',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '7',
        Id: '8',
        Descripcion: 'Mendoza',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '8',
        Id: '9',
        Descripcion: 'La Rioja',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '9',
        Id: '10',
        Descripcion: 'Salta',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '10',
        Id: '11',
        Descripcion: 'San Juan',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '11',
        Id: '12',
        Descripcion: 'San Luis',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.953',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '12',
        Id: '13',
        Descripcion: 'Santa Fé',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '13',
        Id: '14',
        Descripcion: 'Santiago del Estero',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '14',
        Id: '15',
        Descripcion: 'Tucumán',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '16',
        Id: '16',
        Descripcion: 'Chaco',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '17',
        Id: '17',
        Descripcion: 'Chubut',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '18',
        Id: '18',
        Descripcion: 'Formosa',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '19',
        Id: '19',
        Descripcion: 'Misiones',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '20',
        Id: '20',
        Descripcion: 'Neuquen',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '21',
        Id: '21',
        Descripcion: 'La Pampa',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '22',
        Id: '22',
        Descripcion: 'Rio Negro',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '23',
        Id: '23',
        Descripcion: 'Santa Cruz',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });
    factory.create({
        Codigo: '24',
        Id: '24',
        Descripcion: 'Tierra de Fuego',
        Estado: '1',
        FechaCreacion: '2013-03-08 13:28:28.963',
        CodigoPais: 'AR'
    });

}

function cargarTiposMedioPago(factory) {
    factory.create({
        Codigo: '0',
        CodigoMedioPago: '1',
        Descripcion: 'OTRO MEDIO PAGO',
        Estado: '3'
    });
    factory.create({
        Codigo: '1',
        CodigoMedioPago: '3',
        Descripcion: 'VISA',
        Estado: '1'
    });
    factory.create({
        Codigo: '10',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Córdoba',
        Estado: '1'
    });
    factory.create({
        Codigo: '11',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Corrientes',
        Estado: '1'
    });
    factory.create({
        Codigo: '12',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Chaco',
        Estado: '1'
    });
    factory.create({
        Codigo: '13',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Chubut',
        Estado: '1'
    });
    factory.create({
        Codigo: '14',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Entre Ríos',
        Estado: '1'
    });
    factory.create({
        Codigo: '15',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Formosa',
        Estado: '1'
    });
    factory.create({
        Codigo: '16',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Jujuy',
        Estado: '1'
    });
    factory.create({
        Codigo: '17',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB La Pampa',
        Estado: '1'
    });
    factory.create({
        Codigo: '18',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB La Rioja',
        Estado: '1'
    });
    factory.create({
        Codigo: '19',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Mendoza',
        Estado: '1'
    });
    factory.create({
        Codigo: '2',
        CodigoMedioPago: '3',
        Descripcion: 'AGRONACION',
        Estado: '1'
    });
    factory.create({
        Codigo: '20',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Misiones',
        Estado: '1'
    });
    factory.create({
        Codigo: '21',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Neuquén',
        Estado: '1'
    });
    factory.create({
        Codigo: '22',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Río Negro',
        Estado: '1'
    });
    factory.create({
        Codigo: '23',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Salta',
        Estado: '1'
    });
    factory.create({
        Codigo: '24',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB San Juan',
        Estado: '1'
    });
    factory.create({
        Codigo: '25',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB San Luis',
        Estado: '1'
    });
    factory.create({
        Codigo: '26',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Santa Cruz',
        Estado: '1'
    });
    factory.create({
        Codigo: '27',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Santa Fé',
        Estado: '1'
    });
    factory.create({
        Codigo: '28',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Santiago del Estero',
        Estado: '1'
    });
    factory.create({
        Codigo: '29',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Tierra del Fuego',
        Estado: '1'
    });
    factory.create({
        Codigo: '3',
        CodigoMedioPago: '2',
        Descripcion: 'DIFERIDO',
        Estado: '1'
    });
    factory.create({
        Codigo: '30',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Tucumán',
        Estado: '1'
    });
    factory.create({
        Codigo: '31',
        CodigoMedioPago: '7',
        Descripcion: 'Ret. IVA',
        Estado: '1'
    });
    factory.create({
        Codigo: '32',
        CodigoMedioPago: '6',
        Descripcion: 'Ret. Gananc.',
        Estado: '1'
    });
    factory.create({
        Codigo: '33',
        CodigoMedioPago: '8',
        Descripcion: 'Ret. T.Seg/Hig',
        Estado: '1'
    });
    factory.create({
        Codigo: '34',
        CodigoMedioPago: '9',
        Descripcion: 'Ret. Imp. a los sellos',
        Estado: '1'
    });
    factory.create({
        Codigo: '5',
        CodigoMedioPago: '3',
        Descripcion: 'GALICIA RURAL',
        Estado: '1'
    });
    factory.create({
        Codigo: '6',
        CodigoMedioPago: '3',
        Descripcion: 'NARANJA',
        Estado: '1'
    });
    factory.create({
        Codigo: '7',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Capital Federal',
        Estado: '1'
    });
    factory.create({
        Codigo: '8',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Buenos Aires',
        Estado: '1'
    });
    factory.create({
        Codigo: '9',
        CodigoMedioPago: '4',
        Descripcion: 'IIBB Catamarca',
        Estado: '1'
    });
}

function cargarCondicionesDePago(factory) {
    factory.create({
        Codigo: '0001',
        Indice:'1',
        Descripcion: 'Pago Inmediato Sin Deduccion',
        Fecha: '2013-03-04 14:30:13.850',
        Estado: '1'
    });
    factory.create({
        Codigo: "0010",
        Indice: "10",
        Descripcion: "WITHIN 10 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "0011",
        Indice: "11",
        Descripcion: "WITHIN 10 DAYS 3 % CASH DISCOUNT",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "0012",
        Indice: "12",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "0013",
        Indice: "13",
        Descripcion: "PAYABLE ON 20 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "0002",
        Indice: "2",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.777"
    });
    factory.create({
        Codigo: "0003",
        Indice: "3",
        Descripcion: "14 DAYS 3%",
        Fecha: " 20/2%",
        Estado: " 30 NET"
    });
    factory.create({
        Codigo: "0004",
        Indice: "4",
        Descripcion: "AS OF END OF MONTH",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "0005",
        Indice: "5",
        Descripcion: "FROM THE 10TH OS SUBS. MONTH",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "0006",
        Indice: "6",
        Descripcion: "END OF MONTH 4%",
        Fecha: " MID-MONTH 2%",
        Estado: "2013-03-08 13:33:23.777"
    });
    factory.create({
        Codigo: "0007",
        Indice: "7",
        Descripcion: "15TH/31ST SUBS. MONTH 2%",
        Fecha: " ...",
        Estado: "2013-03-08 13:33:23.777"
    });
    factory.create({
        Codigo: "0008",
        Indice: "8",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30/1",
        Estado: "5%"
    });
    factory.create({
        Codigo: "0009",
        Indice: "9",
        Descripcion: "PAYABLE IN 3 INSTALLMENTS",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "A000",
        Indice: "14",
        Descripcion: "Pago Anticipado",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "CI45",
        Indice: "15",
        Descripcion: "WITHIN 45 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN01",
        Indice: "16",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN02",
        Indice: "17",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN03",
        Indice: "18",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.777",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN04",
        Indice: "19",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN05",
        Indice: "20",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN06",
        Indice: "21",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN07",
        Indice: "22",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN08",
        Indice: "23",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN09",
        Indice: "24",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN10",
        Indice: "25",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN11",
        Indice: "26",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN12",
        Indice: "27",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN13",
        Indice: "28",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN14",
        Indice: "29",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN15",
        Indice: "30",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN20",
        Indice: "31",
        Descripcion: "para facturaci�n hasta 20 del mes",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN21",
        Indice: "32",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "CN22",
        Indice: "33",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "DJ01",
        Indice: "34",
        Descripcion: "WITHIN 20 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "DZ21",
        Indice: "35",
        Descripcion: "WITHIN 20 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "FJC0",
        Indice: "36",
        Descripcion: "PAYABLE IMMEDIATELY",
        Fecha: "2013-03-08 13:33:23.787",
        Estado: "1"
    });
    factory.create({
        Codigo: "FJC1",
        Indice: "37",
        Descripcion: "WITHIN 15 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "FJC2",
        Indice: "38",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "FJC3",
        Indice: "39",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "GM00",
        Indice: "40",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "GY00",
        Indice: "41",
        Descripcion: "Pagadero inmediatamente sin DPP",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "I000",
        Indice: "42",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "I001",
        Indice: "43",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "I002",
        Indice: "44",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "I003",
        Indice: "45",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "I00A",
        Indice: "46",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB01",
        Indice: "47",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB02",
        Indice: "48",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB03",
        Indice: "49",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB04",
        Indice: "50",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB05",
        Indice: "51",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB06",
        Indice: "52",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB07",
        Indice: "53",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB08",
        Indice: "54",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB09",
        Indice: "55",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB10",
        Indice: "56",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.797",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB11",
        Indice: "57",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.807",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB12",
        Indice: "58",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.807",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB13",
        Indice: "59",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.807",
        Estado: "1"
    });
    factory.create({
        Codigo: "LB14",
        Indice: "60",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.807",
        Estado: "1"
    });
    factory.create({
        Codigo: "SE15",
        Indice: "61",
        Descripcion: "WITHIN 15 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG00",
        Indice: "62",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG02",
        Indice: "63",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG10",
        Indice: "64",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG15",
        Indice: "65",
        Descripcion: "WITHIN 15 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG20",
        Indice: "66",
        Descripcion: "WITHIN 15 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG30",
        Indice: "67",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG31",
        Indice: "68",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG32",
        Indice: "69",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG33",
        Indice: "70",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG45",
        Indice: "71",
        Descripcion: "WITHIN 45 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG60",
        Indice: "72",
        Descripcion: "WITHIN 90 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG61",
        Indice: "73",
        Descripcion: "WITHIN 90 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG62",
        Indice: "74",
        Descripcion: "WITHIN 90 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG63",
        Indice: "75",
        Descripcion: "WITHIN 60 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG64",
        Indice: "76",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG90",
        Indice: "77",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG91",
        Indice: "78",
        Descripcion: "WITHIN 90 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG92",
        Indice: "79",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "SG93",
        Indice: "80",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.817",
        Estado: "1"
    });
    factory.create({
        Codigo: "TP01",
        Indice: "81",
        Descripcion: "dentro de los 30 días sin DPP",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TP02",
        Indice: "82",
        Descripcion: "dentro de los 60 días sin DPP",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TP03",
        Indice: "83",
        Descripcion: "dentro de los 90 días sin DPP",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TP04",
        Indice: "84",
        Descripcion: "dentro de los 120 días sin DPP",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TP05",
        Indice: "85",
        Descripcion: "dentro de los 150 días sin DPP",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TP06",
        Indice: "86",
        Descripcion: "dentro de los 180 días sin DPP",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TP07",
        Indice: "87",
        Descripcion: "dentro de los 210 días sin DPP",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TR07",
        Indice: "88",
        Descripcion: "PAYABLE ON 20 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TR08",
        Indice: "89",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.827"
    });
    factory.create({
        Codigo: "TR10",
        Indice: "90",
        Descripcion: "PAYABLE ON 20 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TR12",
        Indice: "91",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.827"
    });
    factory.create({
        Codigo: "TR30",
        Indice: "92",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TR32",
        Indice: "93",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TR33",
        Indice: "94",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.827"
    });
    factory.create({
        Codigo: "TR34",
        Indice: "95",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.827"
    });
    factory.create({
        Codigo: "TR35",
        Indice: "96",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.827"
    });
    factory.create({
        Codigo: "TR36",
        Indice: "97",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.827"
    });
    factory.create({
        Codigo: "TR45",
        Indice: "98",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TR55",
        Indice: "99",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.827",
        Estado: "1"
    });
    factory.create({
        Codigo: "TR62",
        Indice: "100",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.827"
    });
    factory.create({
        Codigo: "TR63",
        Indice: "101",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.827"
    });
    factory.create({
        Codigo: "TR64",
        Indice: "102",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.837"
    });
    factory.create({
        Codigo: "TR65",
        Indice: "103",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.837"
    });
    factory.create({
        Codigo: "TR66",
        Indice: "104",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.837"
    });
    factory.create({
        Codigo: "TR93",
        Indice: "105",
        Descripcion: "14 DAYS 2%",
        Fecha: " 30 NET",
        Estado: "2013-03-08 13:33:23.837"
    });
    factory.create({
        Codigo: "TRVS",
        Indice: "106",
        Descripcion: "Final de mes",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW01",
        Indice: "107",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW02",
        Indice: "108",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW03",
        Indice: "109",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW04",
        Indice: "110",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW05",
        Indice: "111",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW06",
        Indice: "112",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW07",
        Indice: "113",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW08",
        Indice: "114",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW09",
        Indice: "115",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW10",
        Indice: "116",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW11",
        Indice: "117",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "TW12",
        Indice: "118",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y003",
        Indice: "119",
        Descripcion: "Dentro de 3 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y005",
        Indice: "120",
        Descripcion: "Dentro de 5 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y007",
        Indice: "121",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y008",
        Indice: "122",
        Descripcion: "Dentro de 8 días deuda vencida",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y010",
        Indice: "123",
        Descripcion: "Dentro de 10 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.837",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y011",
        Indice: "124",
        Descripcion: "2% Descuento en COD",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y012",
        Indice: "125",
        Descripcion: "Cheque Certificado Solamente",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y015",
        Indice: "126",
        Descripcion: "Dentro de 15 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y020",
        Indice: "127",
        Descripcion: "Dia 20  mes siguiente",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y021",
        Indice: "128",
        Descripcion: "Dentro de 21 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y025",
        Indice: "129",
        Descripcion: "Dia 25  mes siguiente",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y028",
        Indice: "130",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y030",
        Indice: "131",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y033",
        Indice: "132",
        Descripcion: "60 Dias Vence fin de mes",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y034",
        Indice: "133",
        Descripcion: "30 Dias Vence 15 del mes proximo",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y040",
        Indice: "134",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y042",
        Indice: "135",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y045",
        Indice: "136",
        Descripcion: "Dentro de 45 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y050",
        Indice: "137",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y056",
        Indice: "138",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y060",
        Indice: "139",
        Descripcion: "Dentro de 60 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y084",
        Indice: "140",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y090",
        Indice: "141",
        Descripcion: "Dentro de 90 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y120",
        Indice: "142",
        Descripcion: "Dentro de 120 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.847",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y300",
        Indice: "143",
        Descripcion: "dentro de los 300 días sin DPP",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y330",
        Indice: "144",
        Descripcion: "dentro de los 330 días sin DPP",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y901",
        Indice: "145",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y902",
        Indice: "146",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y903",
        Indice: "147",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y904",
        Indice: "148",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y905",
        Indice: "149",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y906",
        Indice: "150",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y907",
        Indice: "151",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "Y908",
        Indice: "152",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YA01",
        Indice: "153",
        Descripcion: "Pago inmediato",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB01",
        Indice: "154",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB02",
        Indice: "155",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB03",
        Indice: "156",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB04",
        Indice: "157",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB05",
        Indice: "158",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB06",
        Indice: "159",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB07",
        Indice: "160",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB08",
        Indice: "161",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB09",
        Indice: "162",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB10",
        Indice: "163",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.857",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB11",
        Indice: "164",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB12",
        Indice: "165",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB13",
        Indice: "166",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB14",
        Indice: "167",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB15",
        Indice: "168",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB16",
        Indice: "169",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB17",
        Indice: "170",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB18",
        Indice: "171",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB21",
        Indice: "172",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB5A",
        Indice: "173",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB5B",
        Indice: "174",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YB5C",
        Indice: "175",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YC01",
        Indice: "176",
        Descripcion: "Contra Entrega",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YC02",
        Indice: "177",
        Descripcion: "Efectivo C/E",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YC03",
        Indice: "178",
        Descripcion: "Depósito",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YC04",
        Indice: "179",
        Descripcion: "CH 30 días C/E",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YC05",
        Indice: "180",
        Descripcion: "CH 30-60 días C/E",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YC06",
        Indice: "181",
        Descripcion: "CH 30-60-90 días C/E",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YC07",
        Indice: "182",
        Descripcion: "CH 60-90-120 días C/E",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YCA0",
        Indice: "183",
        Descripcion: "PAYABLE ON 20 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YCH1",
        Indice: "184",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YCH2",
        Indice: "185",
        Descripcion: "30-60 DIAS",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YCH3",
        Indice: "186",
        Descripcion: "30-60-90 DIAS",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YCH4",
        Indice: "187",
        Descripcion: "30-60-90-120 DIAS",
        Fecha: "2013-03-08 13:33:23.867",
        Estado: "1"
    });
    factory.create({
        Codigo: "YCH5",
        Indice: "188",
        Descripcion: "60-90-120 DIAS",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YE10",
        Indice: "189",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YE20",
        Indice: "190",
        Descripcion: "Dentro de 20 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YE30",
        Indice: "191",
        Descripcion: "30 dias final del mes",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YE40",
        Indice: "192",
        Descripcion: "para facturación hasta 20 del mes",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YE60",
        Indice: "193",
        Descripcion: "60 dias final del mes",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YET9",
        Indice: "194",
        Descripcion: "dentro de los 9 días sin DPP",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YGA1",
        Indice: "195",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YGA2",
        Indice: "196",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YGA3",
        Indice: "197",
        Descripcion: "WITHIN 10 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YI00",
        Indice: "198",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YI03",
        Indice: "199",
        Descripcion: "WITHIN 7 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YI04",
        Indice: "200",
        Descripcion: "WITHIN 7 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YI05",
        Indice: "201",
        Descripcion: "WITHIN 7 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YI10",
        Indice: "202",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YI15",
        Indice: "203",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YI25",
        Indice: "204",
        Descripcion: "WITHIN 45 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YJ20",
        Indice: "205",
        Descripcion: "en el día sin DPP",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YJ25",
        Indice: "206",
        Descripcion: "para facturación hasta Fin  del mes",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YJ26",
        Indice: "207",
        Descripcion: "para facturación hasta 15 del mes",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YJ27",
        Indice: "208",
        Descripcion: "para facturación hasta Fin  del mes",
        Fecha: "2013-03-08 13:33:23.877",
        Estado: "1"
    });
    factory.create({
        Codigo: "YJ28",
        Indice: "209",
        Descripcion: "para facturación hasta 06 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YM11",
        Indice: "210",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YM22",
        Indice: "211",
        Descripcion: "Dentro de 3 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMG1",
        Indice: "212",
        Descripcion: "en el día sin DPP",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMG2",
        Indice: "213",
        Descripcion: "dentro de los 2 días sin DPP",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMG4",
        Indice: "214",
        Descripcion: "dentro de los 4 días sin DPP",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMG5",
        Indice: "215",
        Descripcion: "dentro de los 5 días sin DPP",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMG6",
        Indice: "216",
        Descripcion: "para facturación hasta 10 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMG7",
        Indice: "217",
        Descripcion: "para facturación hasta 10 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMG8",
        Indice: "218",
        Descripcion: "para facturación hasta 10 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMU1",
        Indice: "219",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMU2",
        Indice: "220",
        Descripcion: "15 dias final del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMU3",
        Indice: "221",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMU4",
        Indice: "222",
        Descripcion: "para facturación hasta 15 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YMU5",
        Indice: "223",
        Descripcion: "dentro de los 20 días sin DPP",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YR15",
        Indice: "224",
        Descripcion: "para facturación hasta 15 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YR20",
        Indice: "225",
        Descripcion: "para facturación hasta 15 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YR25",
        Indice: "226",
        Descripcion: "para facturación hasta 10 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YR30",
        Indice: "227",
        Descripcion: "para facturación hasta 15 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YR42",
        Indice: "228",
        Descripcion: "dentro de los 42 días sin DPP",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YR45",
        Indice: "229",
        Descripcion: "para facturación hasta 15 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YR60",
        Indice: "230",
        Descripcion: "para facturación hasta 15 del mes",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YVN1",
        Indice: "231",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.887",
        Estado: "1"
    });
    factory.create({
        Codigo: "YVN2",
        Indice: "232",
        Descripcion: "PAYABLE ON 15 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z000",
        Indice: "233",
        Descripcion: "Pago inmediato",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z002",
        Indice: "234",
        Descripcion: "Final de mes",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z003",
        Indice: "235",
        Descripcion: "Dentro de 3 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z004",
        Indice: "236",
        Descripcion: "Dentro de 6 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z005",
        Indice: "237",
        Descripcion: "dentro de los 5 días sin DPP",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z006",
        Indice: "238",
        Descripcion: "Dentro de 6 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z007",
        Indice: "239",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z008",
        Indice: "240",
        Descripcion: "Dentro de 8 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z00A",
        Indice: "241",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z00B",
        Indice: "242",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z010",
        Indice: "243",
        Descripcion: "Dentro de 10 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.897",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z011",
        Indice: "244",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z012",
        Indice: "245",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z013",
        Indice: "246",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z014",
        Indice: "247",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z015",
        Indice: "248",
        Descripcion: "Dentro de 15 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z016",
        Indice: "249",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z017",
        Indice: "250",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z018",
        Indice: "251",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z019",
        Indice: "252",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z020",
        Indice: "253",
        Descripcion: "Dentro de 20 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z021",
        Indice: "254",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z022",
        Indice: "255",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z023",
        Indice: "256",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z024",
        Indice: "257",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z025",
        Indice: "258",
        Descripcion: "Dentro de 25 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z026",
        Indice: "259",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z027",
        Indice: "260",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z029",
        Indice: "261",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z02D",
        Indice: "262",
        Descripcion: "Dentro de 6 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z030",
        Indice: "263",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.927",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z031",
        Indice: "264",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z032",
        Indice: "265",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z033",
        Indice: "266",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z034",
        Indice: "267",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z035",
        Indice: "268",
        Descripcion: "Dentro de 35 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z036",
        Indice: "269",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z037",
        Indice: "270",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z038",
        Indice: "271",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z039",
        Indice: "272",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z03D",
        Indice: "273",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z03P",
        Indice: "274",
        Descripcion: "WITHIN 7 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z040",
        Indice: "275",
        Descripcion: "Dentro de 40 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z041",
        Indice: "276",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z043",
        Indice: "277",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z044",
        Indice: "278",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z045",
        Indice: "279",
        Descripcion: "Dentro de 45 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z046",
        Indice: "280",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z047",
        Indice: "281",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z048",
        Indice: "282",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z049",
        Indice: "283",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z050",
        Indice: "284",
        Descripcion: "Dentro de 50 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z051",
        Indice: "285",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.937",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z052",
        Indice: "286",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z053",
        Indice: "287",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z054",
        Indice: "288",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z055",
        Indice: "289",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z056",
        Indice: "290",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z057",
        Indice: "291",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z058",
        Indice: "292",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z059",
        Indice: "293",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z05D",
        Indice: "294",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z060",
        Indice: "295",
        Descripcion: "Dentro de 60 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z061",
        Indice: "296",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z062",
        Indice: "297",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z063",
        Indice: "298",
        Descripcion: "Dentro de 63 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z064",
        Indice: "299",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z065",
        Indice: "300",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z066",
        Indice: "301",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z067",
        Indice: "302",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z068",
        Indice: "303",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z069",
        Indice: "304",
        Descripcion: "Dentro de 69 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z070",
        Indice: "305",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z071",
        Indice: "306",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z072",
        Indice: "307",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z073",
        Indice: "308",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.947",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z074",
        Indice: "309",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z075",
        Indice: "310",
        Descripcion: "Dentro de 75 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z076",
        Indice: "311",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z077",
        Indice: "312",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z078",
        Indice: "313",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z079",
        Indice: "314",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z07B",
        Indice: "315",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z07D",
        Indice: "316",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z080",
        Indice: "317",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z081",
        Indice: "318",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z082",
        Indice: "319",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z083",
        Indice: "320",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z084",
        Indice: "321",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z085",
        Indice: "322",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z086",
        Indice: "323",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z087",
        Indice: "324",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z088",
        Indice: "325",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z089",
        Indice: "326",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z090",
        Indice: "327",
        Descripcion: "Dentro de 90 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z095",
        Indice: "328",
        Descripcion: "Dentro de 95 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z100",
        Indice: "329",
        Descripcion: "Dentro de 95 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z105",
        Indice: "330",
        Descripcion: "Dentro de 95 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z106",
        Indice: "331",
        Descripcion: "Dentro de 105 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.957",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z107",
        Indice: "332",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z108",
        Indice: "333",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z10B",
        Indice: "334",
        Descripcion: "dentro de los 10 d�as sin DPP",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z110",
        Indice: "335",
        Descripcion: "Dentro de 95 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z112",
        Indice: "336",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z113",
        Indice: "337",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z115",
        Indice: "338",
        Descripcion: "Dentro de 95 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z118",
        Indice: "339",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z120",
        Indice: "340",
        Descripcion: "Dentro de 120 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z125",
        Indice: "341",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z12D",
        Indice: "342",
        Descripcion: "Dentro de 95 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z130",
        Indice: "343",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z135",
        Indice: "344",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z140",
        Indice: "345",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z145",
        Indice: "346",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z150",
        Indice: "347",
        Descripcion: "Dentro de 150 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z153",
        Indice: "348",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z15B",
        Indice: "349",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z15D",
        Indice: "350",
        Descripcion: "WITHIN 15 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z165",
        Indice: "351",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z180",
        Indice: "352",
        Descripcion: "Dentro de 180 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z195",
        Indice: "353",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z210",
        Indice: "354",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.967",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z240",
        Indice: "355",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z270",
        Indice: "356",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z300",
        Indice: "357",
        Descripcion: "pagable en 3 importes parciales",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z301",
        Indice: "358",
        Descripcion: "al Fin del mes siguiente sin DPP",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z302",
        Indice: "359",
        Descripcion: "hasta el Fin en el mes 2 sin DPP",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z303",
        Indice: "360",
        Descripcion: "hasta el Fin en el mes 3 sin DPP",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z304",
        Indice: "361",
        Descripcion: "Swift 90 días",
        Fecha: " d�a 30",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z305",
        Indice: "362",
        Descripcion: "Swift 120 días",
        Fecha: " d�a 30",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z306",
        Indice: "363",
        Descripcion: "Transferencia 90 días",
        Fecha: " d�a 5",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z307",
        Indice: "364",
        Descripcion: "hasta el 10. en el mes 2 sin DPP",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z308",
        Indice: "365",
        Descripcion: "hasta el 10. en el mes 3 sin DPP",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z309",
        Indice: "366",
        Descripcion: "Transferencia 90 días",
        Fecha: " d�a 10",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z30B",
        Indice: "367",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z30D",
        Indice: "368",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z310",
        Indice: "369",
        Descripcion: "hasta el 15. en el mes 2 sin DPP",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z311",
        Indice: "370",
        Descripcion: "hasta el 15. en el mes 3 sin DPP",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z312",
        Indice: "371",
        Descripcion: "Swift 90 días",
        Fecha: " dias 10-20-30",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z313",
        Indice: "372",
        Descripcion: "Transf. 120 d�as",
        Fecha: " dia 10y25",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z314",
        Indice: "373",
        Descripcion: "al 25 del mes siguiente sin DPP",
        Fecha: "2013-03-08 13:33:23.977",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z315",
        Indice: "374",
        Descripcion: "dentro de los 10 días 0",
        Fecha: "5 % descuento",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z316",
        Indice: "375",
        Descripcion: "dentro de los 10 días 0",
        Fecha: "5 % descuento",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z317",
        Indice: "376",
        Descripcion: "dentro de los 30 días 0",
        Fecha: "5 % descuento",
        Estado: "2013-03-08 13:33:23.977"
    });
    factory.create({
        Codigo: "Z318",
        Indice: "377",
        Descripcion: "dentro de los 10 días 1 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z319",
        Indice: "378",
        Descripcion: "dentro de los 10 días 1 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z320",
        Indice: "379",
        Descripcion: "al 10 del mes siguiente 1",
        Fecha: "5 % descuento",
        Estado: "2013-03-08 13:33:23.987"
    });
    factory.create({
        Codigo: "Z321",
        Indice: "380",
        Descripcion: "dentro de los 15 días 1 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z322",
        Indice: "381",
        Descripcion: "dentro de los 15 días 1 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z323",
        Indice: "382",
        Descripcion: "dentro de los 15 días 2 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z324",
        Indice: "383",
        Descripcion: "dentro de los 7 días 2 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z325",
        Indice: "384",
        Descripcion: "pagable en 2 importes parciales",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z326",
        Indice: "385",
        Descripcion: "Pagadero inmediatamente 1 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z327",
        Indice: "386",
        Descripcion: "dentro de los 10 días 2 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z328",
        Indice: "387",
        Descripcion: "dentro de los 10 días 3 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z329",
        Indice: "388",
        Descripcion: "para facturación hasta 20 del mes",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z330",
        Indice: "389",
        Descripcion: "dentro de los 50 días sin DPP",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z331",
        Indice: "390",
        Descripcion: "Pagadero inmediatamente 1 % descuento",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z350",
        Indice: "391",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z360",
        Indice: "392",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z45B",
        Indice: "393",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z50D",
        Indice: "394",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z51A",
        Indice: "395",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z51I",
        Indice: "396",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z52A",
        Indice: "397",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z52I",
        Indice: "398",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z53A",
        Indice: "399",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.987",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z53I",
        Indice: "400",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z54A",
        Indice: "401",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z54I",
        Indice: "402",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z550",
        Indice: "403",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z55A",
        Indice: "404",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z55D",
        Indice: "405",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z55I",
        Indice: "406",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z56A",
        Indice: "407",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z56I",
        Indice: "408",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z57A",
        Indice: "409",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z57I",
        Indice: "410",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z58A",
        Indice: "411",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z58I",
        Indice: "412",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z59A",
        Indice: "413",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z59I",
        Indice: "414",
        Descripcion: "PAY IMMEDIATELY W/O DEDUCTION",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z60B",
        Indice: "415",
        Descripcion: "dentro de los 60 d�as sin DPP",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z65D",
        Indice: "416",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z70D",
        Indice: "417",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z80D",
        Indice: "418",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "Z85D",
        Indice: "419",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZA00",
        Indice: "420",
        Descripcion: "Pago Contado",
        Fecha: "2013-03-08 13:33:23.997",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZA01",
        Indice: "421",
        Descripcion: "Pago Contado",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZA02",
        Indice: "422",
        Descripcion: "PAYABLE IMMEDIATELY BLOCKED FOR PAYMENT",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZA0D",
        Indice: "423",
        Descripcion: "Pago Contado",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCA1",
        Indice: "424",
        Descripcion: "al 10 del mes siguiente 2 % descuento",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCA2",
        Indice: "425",
        Descripcion: "al 15 del mes siguiente 2 % descuento",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCA3",
        Indice: "426",
        Descripcion: "dentro de los 31 días 2 % descuento",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCA4",
        Indice: "427",
        Descripcion: "dentro de los 60 días 1 % descuento",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCA5",
        Indice: "428",
        Descripcion: "al 25 del mes siguiente sin DPP",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCA6",
        Indice: "429",
        Descripcion: "dentro de los 10 días 5 % descuento",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCA7",
        Indice: "430",
        Descripcion: "15TH/31ST SUBS. MONTH 2%",
        Fecha: " ...",
        Estado: "2013-03-08 13:33:24.007"
    });
    factory.create({
        Codigo: "ZCA8",
        Indice: "431",
        Descripcion: "PAYABLE ON 20 OF NEXT MONTH",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCA9",
        Indice: "432",
        Descripcion: "Pagadero inmediatamente sin DPP",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCAA",
        Indice: "433",
        Descripcion: "Pagadero inmediatamente sin DPP",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCAB",
        Indice: "434",
        Descripcion: "Pagadero inmediatamente sin DPP",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCAC",
        Indice: "435",
        Descripcion: "Pagadero inmediatamente sin DPP",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCH1",
        Indice: "436",
        Descripcion: "15-45 DIAS",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCH2",
        Indice: "437",
        Descripcion: "30-60 DIAS",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCH3",
        Indice: "438",
        Descripcion: "30-60-90 DIAS",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCH4",
        Indice: "439",
        Descripcion: "30-60-90-120 DIAS",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCH5",
        Indice: "440",
        Descripcion: "60-90-120 DIAS",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCM1",
        Indice: "441",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCM2",
        Indice: "442",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:24.007",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZCM3",
        Indice: "443",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZE15",
        Indice: "444",
        Descripcion: "15 dias final del mes",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZE30",
        Indice: "445",
        Descripcion: "30 dias final del mes",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZE45",
        Indice: "446",
        Descripcion: "45 dias final del mes",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZE60",
        Indice: "447",
        Descripcion: "60 dias final del mes",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZE75",
        Indice: "448",
        Descripcion: "75 dias final del mes",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZE90",
        Indice: "449",
        Descripcion: "90 dias final del mes",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZKH1",
        Indice: "450",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZM00",
        Indice: "451",
        Descripcion: "Pago Contado",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZM07",
        Indice: "452",
        Descripcion: "Dentro de 7 dias deuda vencida",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZM14",
        Indice: "453",
        Descripcion: "Dentro de 14 dias deuda vencida",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZM21",
        Indice: "454",
        Descripcion: "Dentro de 21 dias deuda vencida",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZM30",
        Indice: "455",
        Descripcion: "Dentro de 30 dias deuda vencida",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZM75",
        Indice: "456",
        Descripcion: "Dentro de 75 dias deuda vencida",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
    factory.create({
        Codigo: "ZYT1",
        Indice: "457",
        Descripcion: "PAY WITHIN 30 DAYS DUE NET",
        Fecha: "2013-03-08 13:33:24.017",
        Estado: "1"
    });
}