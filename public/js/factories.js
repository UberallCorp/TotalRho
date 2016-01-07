/**
 * Created by Ea
 */
var factoriesModule = angular.module('factoriesModule', []);

function parseBool(argument) {
    if (argument == 'true') {
        return true;
    } else {
        return false;
    }
}

factoriesModule.factory('PedidosFactory', function () {
    var factory = {}; // define factory object

    var ormModel = Rho.ORM.getModel("Pedido");

    factory.pedidos = [];

    factory.loadAll = function () {
        // we do not want to reassign the array, because we are binding it in the
        // Home controller's scope and that would break the binding. Instead, we
        // just empty it before loading products from the database
        this.pedidos.splice(0, this.pedidos.length);

        var rhoItems = ormModel.find("all",{
            order:"Localidad",
            orderdir:"DESC",
            conditions:{}
        });

        for (var i = 0; i < rhoItems.length; i++) {
            var rhoItem = rhoItems[i];
            this.pedidos.push(this.toHash(rhoItem));
        }
    };

    factory.getPendientesDeConfirmacion = function () {
        var pendientes = ormModel.find("all", {conditions: {"ACK": 0}});

        var pendientesHash = [];    

        for (var i = 0; i < pendientes.length; i++) {
            var rhoItem = pendientes[i];
            pendientesHash.push(this.toHash(rhoItem));
        }

        return pendientesHash;
    };

    factory.deleteAll = function () {
        var rhoItems = ormModel.find("all");
            for (var i = 0; i < rhoItems.length; i++) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.pedidosAgenda = function () {

        factory.loadAll();

        var statusAgenda = 2;

        var pedidosAgenda = [];



        factory.pedidos.forEach(function (pedido, i, pedidos) {
            if (pedido.CodigoStatusPedido == 2)
                pedidosAgenda.push(pedido);
        });

        return pedidosAgenda;
    };

    factory.create = function (params) {

        var rhoItem = ormModel.create(params);
        var hash = this.toHash(rhoItem);
        this.pedidos.push(hash);

        return hash;
    };

    factory.findById = function (idItem) {
        var pedido = null;
        try {
            pedido = this.toHash(ormModel.find("first", {conditions: {"NumeroPedido": idItem}}));
        } catch (e) {
            console.log("Error al recuperar pedido por numeroPedido");
            console.log(e.message);
            console.log(e);
        }
        return pedido;
    };

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            NombreCliente: rhoItem.get("Nombre_Cliente"),
            Latitud: rhoItem.get("Latitud"),
            Longitud: rhoItem.get("Longitud"),
            Autorizacion: rhoItem.get("Autorizacion"),
            Bloqueado: rhoItem.get("Bloqueado"),
            CantidadPedida: rhoItem.get("Cantidad_Pedida"),
            CodigoCamion: rhoItem.get("Codigo_Camion"),
            CodigoChofer: rhoItem.get("Codigo_Chofer"),
            CodigoCliente: rhoItem.get("Codigo_Cliente"),
            CodigoSector: rhoItem.get("Codigo_Sector"),
            CodigoTransporte: rhoItem.get("Codigo_Transporte"),
            CodigoStatusPedido: rhoItem.get("CodigoStatusPedido"),
            CodigoTipoCliente: rhoItem.get("CodigoTipoCliente"),
            CondicionPago: rhoItem.get("Cond_Pago"),
            Cuit: rhoItem.get("Cuit"),
            DireccionDestinatario: rhoItem.get("Direccion_Destinatario"),
            Estado: rhoItem.get("Estado_Pedido"),
            Fecha: rhoItem.get("Fecha"),
            FechaEntrega: rhoItem.get("Fecha_Entrega"),
            IIBB: rhoItem.get("IIBB"),
            IndPedidos: rhoItem.get("Ind_Pedidos"),
            IVA: rhoItem.get("IVA"),
            Localidad: rhoItem.get("Localidad"),
            NombreDestinatario: rhoItem.get("Nombre_Destinatario"),
            NumeroPedido: rhoItem.get("NumeroPedido"),
            NumeroPedidoCRM: rhoItem.get("NumeroPedidoCRM"),
            Observacion: rhoItem.get("Observacion"),
            PercepIVA: rhoItem.get("Percep_IVA"),
            Precio: rhoItem.get("Precio"),
            Prioridad: rhoItem.get("Prioridad"),
            Reclamo: rhoItem.get("Reclamo"),
            Region: rhoItem.get("Region"),
            Ruta: rhoItem.get("Ruta"),
            SIT: rhoItem.get("SIT"),
            Zona: rhoItem.get("Zona"),
            ACK: rhoItem.get("ACK"),
            Revision: rhoItem.get("Revision")
        }
    };

    return factory; // returning factory to make it ready to be pulled by the controller
});

factoriesModule.factory("ConfigPantallaFactory", function(){
    var factory = {};

    var ormModel = Rho.ORM.getModel("ConfigPantalla");

    //Get screen configuration from DB.
    factory.getConfig = function(){
        var contrastValue = ormModel.find("all");

        if(contrastValue.length > 0 && contrastValue !== null && contrastValue !== 'undefined' ){
            console.log('hay algo');
            console.log(contrastValue);
            return this.toHash(contrastValue[0]);
        }

        return null;
    }

    //Update items in DB.
    factory.update = function(params){
        var rhoItem = ormModel.find('all');
        rhoItem[0].updateAttributes(params);
    }

    //Create item in DB
    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        var hash = this.toHash(rhoItem);
        return hash;
    };

    //Return the Hash items.
    factory.toHash = function(rhoItem){
        return {
            rhoItem: rhoItem, 
            object: rhoItem.object(),
            Contrast: rhoItem.get("Contrast"),
            FontSize: rhoItem.get("FontSize")
        };
    }

    return factory;
});

factoriesModule.factory('ClientesFactory', function ($q) {
    var factory = {}; // define factory object

    var ormModel = Rho.ORM.getModel("Cliente_PDA");

    factory.clientes = [];

    factory.loadAll = function () {
        // we do not want to reassign the array, because we are binding it in the
        // Home controller's scope and that would break the binding. Instead, we
        // just empty it before loading products from the database
        this.clientes.splice(0, this.clientes.length);

        var rhoItems = ormModel.find("all");

        for (var i = 0; i < rhoItems.length; i++) {
            var rhoItem = rhoItems[i];
            this.clientes.push(this.toHash(rhoItem));
        }
    };

    factory.deleteAll = function () {
        var rhoItems = ormModel.find("all");
        for (var i = 0; i < rhoItems.length; i++) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.findById = function (idItem) {
        var clienteEncontrado = null;
        try {
            clienteEncontrado = this.toHash(ormModel.find("first", {conditions: {"CodigoCliente": idItem}}));
        } catch (e) {
            console.log("Error buscando al cliente por codigo");
            console.log(e.message);
            console.log(e);
        }

        return clienteEncontrado;
    };

    factory.getPendientesDeConfirmacion = function () {
            var pendientes = ormModel.find("all", {conditions: {"ACK": 0}});

            var pendientesHash = [];

            for (var i = 0; i < pendientes.length; i++) {
                var rhoItem = pendientes[i];
                pendientesHash.push(this.toHash(rhoItem));
            }

            return pendientesHash;
        };

    factory.findByName = function (name) {
        var listaClientes = null;
        try {
            listaClientes = this.toHash(ormModel.find('all', {conditions: {"NombreCliente": name}}))
        } catch (e) {
            console.log("Error Buscando cliente por código.");
            console.log(e.message);
            console.log(e);
        }
        return listaClientes;
    };

    factory.find = function (searchString) {

        var deferred = $q.defer();

        var listaClientes = [];

        for (var i = 0; i < factory.clientes.length; i++) {
            var cliente = factory.clientes[i];
            if(contains(cliente.nombreCliente,searchString) || contains(cliente.codigoCliente,searchString) ||contains(cliente.calle,searchString)){
                listaClientes.push(cliente);
            }
        }

        deferred.resolve(listaClientes);

        return deferred.promise;
    };

    function contains (str1,str2){
        return str1.toLowerCase().indexOf(str2.toLowerCase()) > -1;
    }

    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        var hash = this.toHash(rhoItem);
        this.clientes.push(hash);

        return hash;
    };

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            autorizacion: rhoItem.get("Autorizacion"),
            calle: rhoItem.get("Calle"),
            condicion_Pago: rhoItem.get("Condicion_Pago"),
            codigo_destinatario: rhoItem.get("Codigo_destinatario"),
            codigo_EstadoSAP: rhoItem.get("Codigo_EstadoSAP"),
            codigo_planta: rhoItem.get("Codigo_planta"),
            codigo_postal: rhoItem.get("Codigo_postal"),
            codigo_TipoCliente: rhoItem.get("Codigo_TipoCliente"),
            codigoCliente: rhoItem.get("CodigoCliente"),
            cuit: rhoItem.get("Cuit"),
            estado_cliente: rhoItem.get("Estado_cliente"),
            estado_SAP: rhoItem.get("Estado_SAP"),
            material: rhoItem.get("Material"),
            NIF: rhoItem.get("NIF"),
            nombreCliente: rhoItem.get("NombreCliente"),
            pais: rhoItem.get("Pais"),
            IVA: rhoItem.get("IVA"),
            localidad: rhoItem.get("Localidad"),
            PI: rhoItem.get("PI"),
            PIB: rhoItem.get("PIB"),
            poblacion: rhoItem.get("Poblacion"),
            telefono: rhoItem.get("Telefono"),
            tipo_cliente: rhoItem.get("Tipo_cliente"),
            transporte: rhoItem.get("Transporte"),
            precio: rhoItem.get("Precio"),
            region: rhoItem.get("Region"),
            sector: rhoItem.get("Sector"),
            zona: rhoItem.get("Zona"),
            latitud: rhoItem.get("Latitud"),
            longitud: rhoItem.get("Longitud"),
            ACK: rhoItem.get("ACK")
        }
    };

    return factory; // returning factory to make it ready to be pulled by the controller
});

factoriesModule.factory('WS', function ($rootScope, $http, $q) {
    var factory = {}; // define factory object

    factory.getMethod = function (parameters) {

        return $http.get($rootScope.baseURL + parameters)
            .then(function (response) {
                return response.data;
            }, function (response) {
                return $q.reject(response.data);
            });
    };

    return factory; // returning factory to make it ready to be pulled by the controller
});

factoriesModule.factory('TIAPDAFactory', function ($rootScope) {
    var factory = {}; // define factory object

    var ormModel = Rho.ORM.getModel("TIAPDA");

    factory.deleteAll = function () {
        var rhoItems = ormModel.find("all");
        for (var i = 0; i < rhoItems.length; i++) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        return this.toHash(rhoItem);
    }

    factory.getAll = function () {
        var result = [];
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            result.push(this.toHash(rhoItem));
        }
        ;
        return result;
    }

    factory.update = function (attributes) {
        var rhoItem = ormModel.find('first', {conditions: {'ID': '1'}});
        rhoItem.updateAttributes(attributes);
    }

    factory.select = function (column, conditionsParam) {
        return this.toHash(ormModel.find('first', {
            select: [column],
            conditions: conditionsParam
        }));
    };

    factory.getElement = function () {
        return this.toHash(ormModel.find('first', {
            conditions: {
                ID: '1'
            }
        }));
    };

    factory.getHash = function () {
        return this.toHash(ormModel.find("first"));
    };

    factory.toHash = function (rhoItem) {
        return {
            object: rhoItem.object(),
            rhoItem: rhoItem,
            ID: rhoItem.get('ID'),
            Arrastre: Number(rhoItem.get('Arrastre')),
            Estado: rhoItem.get('Estado'),
            Fecha: rhoItem.get('Fecha'),
            Hora: rhoItem.get('Hora'),
            DP: Number(rhoItem.get('DP')),
            KG: Number(rhoItem.get('KG')),
            KC: Number(rhoItem.get('KC')),
            KM: Number(rhoItem.get('KM')),
            NT: rhoItem.get('NT'),
            PC: Number(rhoItem.get('PC'))
        }
    };

    return factory; // returning factory to make it ready to be pulled by the controller 
});

factoriesModule.factory('GPSFactory', function ($rootScope) {
    var factory = {}; // define factory object

    var ormModel = Rho.ORM.getModel("GPS");

    var locations = [];

    //Esta variable se encarga de trackear si ya se ha avisado que el GPS no funciona.
    //En caso de que no funcione entonces se avisa solo 1 vez.
    $rootScope.GPSAlertOpened = false;

    factory.loadAll = function () {
        locations.splice(0, locations.length);

        var rhoItems = ormModel.find("all");

        for (var i = 0; i < rhoItems.length; i++) {
            var rhoItem = rhoItems[i];
            locations.push(this.toHash(rhoItem));
        }
    };

    factory.deleteAll = function () {
        var rhoItems = ormModel.find("all");
        for (var i = 0; i < rhoItems.length; i++) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.getNotSent = function () {
        var resultado = [];
        var rhoItems = ormModel.find("all", {conditions: {"Enviado": 0}});
        if (rhoItems && rhoItems.length > 0) {
            for (var i = 0; i < rhoItems.length; i++) {
                resultado.push(this.toHash(rhoItems[i]));
            }
        }
        return resultado;
    };

    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        var hash = this.toHash(rhoItem);
        locations.push(hash);

        return hash;
    };

    factory.getNewId = function (hr) {
        var newId = 1;

        var locationWithMaxId = null;
        try {
            locationWithMaxId = ormModel.find("count",
                    {
                        conditions: {"HR":hr} // JavaScript API requires conditions
                    });
        } catch (e) {
            console.log(e.message);
        }
        if (locationWithMaxId) {
            newId = Number(locationWithMaxId) + 1;
        }

        return newId;
    };

    factory.eliminarPosicionesGPSParaHR = function(hr){
        var rhoItems = ormModel.find("all",{conditions:{"HR":hr}});
        for (var i = 0; i < rhoItems.length; i++) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.iniciarCapturaGPS = function(){

        var datosUsuario = syncManager.getDatosUsuario();

        try{
            Rho.GeoLocation.set_notification(function (params){
                var gpsAvailable = params.known_position;
                if(gpsAvailable !== 'undefined'){
                    if(gpsAvailable == 1){
                        var latitude = params.latitude;
                        var longitude = params.longitude;

                        if(latitude != "0.00" && longitude != "0.00"){
                            var fechaActual = new moment().format("MM/DD/YYYY");
                            var horaActual =  new moment().format("HH:mm:ss");

                            factory.create({
                                'Id': factory.getNewId(datosUsuario.ntr),
                                //'Cliente':null,
                                'Enviado': 0,
                                'Fecha': fechaActual + " " + horaActual,
                                'HR': datosUsuario.ntr,
                                'Latitud': latitude,
                                'Longitud': longitude,
                                'UUID': datosUsuario.idpda
                            });

                            console.log("GUARDADO DE LATITUD: "+latitude);

                            $rootScope.posicionGPSActual.latitude = latitude;
                            $rootScope.posicionGPSActual.longitude = longitude;
                            factory.detenerGPS();
                        }else{
                            console.log("NO GUARDADO DE LATITUD: "+latitude);
                        }
                    }else{
                        if(!$rootScope.GPSAlertOpened){
                            showAlert('Total Argentina', 'No se pudo geolocalizar. Encender el GPS, dirigirse a un lugar abierto e intentar nuevamente.');
                            $rootScope.GPSAlertOpened = true;
                        }
                    }
                }else{
                    if(!$rootScope.GPSAlertOpened){
                        showAlert('Total Argentina', 'No se pudo geolocalizar. Encender el GPS, dirigirse a un lugar abierto e intentar nuevamente.');
                        $rootScope.GPSAlertOpened = true;
                    }
                }
            },"",3000);
        }catch(e){
            showAlert('Total Argentina', 'Error inesperado en la geolocalizacion.');
        }
    };

    factory.detenerGPS = function(){
        Rho.GeoLocation.turnoff();
    };

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            id: rhoItem.get('Id'),
            cliente: rhoItem.get('Cliente'),
            enviado: rhoItem.get('Enviado'),
            fecha: rhoItem.get('Fecha'),
            HR: rhoItem.get('HR'),
            latitud: rhoItem.get('Latitud'),
            longitud: rhoItem.get('Longitud'),
            //stringGPS: rhoItem.get('StringGPS'),
            UUID: rhoItem.get('UUID')
        }
    };

    return factory;
});

factoriesModule.factory('UDFactory', function () {
    var factory = {};

    var ormModel = Rho.ORM.getModel('UsuarioDatos');

    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.select = function (column, conditionsParam) {
        return ormModel.find('all', {
            select: [column],
            conditions: conditionsParam
        });
    };

    factory.selectItem = function (conditionsParam) {
        return ormModel.find('all', {
            conditions: conditionsParam
        });
    };

    factory.getAll = function () {
        var result = [];
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            result.push(this.toHash(rhoItem));
        }
        ;
        return result;
    }

    factory.toHash = function (rhoItem) {
        return {
             object: rhoItem.object(),
            rhoItem: rhoItem,
             ID: rhoItem.get('ID'),
             IDPDA: rhoItem.get('IDPDA'),
             Version: rhoItem.get('Version'),
             Usuario: rhoItem.get('Usuario'),
             Password: rhoItem.get('Password'),
             Nombre: rhoItem.get('Nombre'),
             Fecha: rhoItem.get('Fecha'),
             Hora: rhoItem.get('Hora'),
             GPS: rhoItem.get('GPS'),
             HR: rhoItem.get('HR'),
             UsuarioFTP: rhoItem.get('UsuarioFTP'),
            PassFTP: rhoItem.get('PassFTP'),
            IpFTP: rhoItem.get('IpFTP'),
            DirFTP: rhoItem.get('DirFTP')
        }
    };
    return factory;
});


factoriesModule.factory('EntregaFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('Entrega');
    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.getNotSent = function () {
        var resultado = [];
        var rhoItems = ormModel.find("all", {conditions: {"Enviado": 0}});
        if (rhoItems && rhoItems.length > 0) {
            for (var i = 0; i < rhoItems.length; i++) {
                resultado.push(this.toHash(rhoItems[i]));
            }
        }

        return resultado;
    };

    factory.getEspNotSent = function(){
        var resultado = [];
        var rhoItems = ormModel.find('all', {
            conditions:{
                Enviado: '0',
                Espontaneo: '1'
            }
        });

        if(rhoItems != undefined && rhoItems != null){
            for(var i = 0; i < rhoItems.length; i++){
                resultado.push(this.toHash(rhoItems[i]));
            }
        }
        return resultado;
    };

    factory.select = function(column, conditionsParam){
        return ormModel.find('all', {
            select: [column],
            conditions: conditionsParam
        });
    };

    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        return this.toHash(rhoItem);
    };

    factory.findById = function (idItem) {
        var pedido = null;
        try {
            pedido = this.toHash(ormModel.find("first", {conditions: {"NumeroPedido": idItem}}));
        } catch (e) {
            console.log("Error al recuperar pedido por numeroPedido");
            console.log(e.message);
            console.log(e);
        }
        return pedido;
    };

    factory.deleteById = function (idItem) {
        var deleted = false;
        try {
            var entrega = ormModel.find("first", {conditions: {"NumeroPedido": idItem}});
            if (entrega) {
                entrega.destroy();
                deleted = true;
            }
        } catch (e) {
            console.log("Error al recuperar pedido por numeroPedido");
            console.log(e.message);
            console.log(e);
        }
        return deleted;
    };

    factory.findByNumeroDocumento = function (numeroDocumento) {
        var resultado = [];
        try {
            var rhoItems = ormModel.find("all", {conditions: {"NumeroDocumento": numeroDocumento}});
            if (rhoItems && rhoItems.length > 0) {
                for (var i = 0; i < rhoItems.length; i++) {
                    resultado.push(this.toHash(rhoItems[i]));
                }
            }
        } catch (e) {
            console.log("Error al recuperar pedido por numeroDocumento");
            console.log(e.message);
            console.log(e);
        }
        return resultado;
    };

    factory.numberOfItems = function () {
        return ormModel.find('all').length;
    };

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            CantidadVendida: rhoItem.get('CantidadVendida'),
            CodigoCliente: rhoItem.get('CodigoCliente'),
            CodigoMotivo: rhoItem.get('CodigoMotivo'),
            CodigoProducto: rhoItem.get('CodigoProducto'),
            ControlCarga: rhoItem.get('ControlCarga'),
            Estado: rhoItem.get('Estado'),
            FechaEnv: rhoItem.get('FechaEnv'),
            IIBB: rhoItem.get('IIBB'),
            IVA: rhoItem.get('IVA'),
            PercepcionIVA: rhoItem.get('PercepcionIVA'),
            Latitud: rhoItem.get('Latitud'),
            Longitud: rhoItem.get('Longitud'),
            NumeroDocumento: rhoItem.get('NumeroDocumento'),
            NumeroPedido: rhoItem.get('NumeroPedido'),
            NumeroPedidoCRM: rhoItem.get('NumeroPedidoCRM'),
            PI: rhoItem.get('PI'),
            Precio: rhoItem.get('Precio'),
            Precinto: rhoItem.get('Precinto'),
            PrecioTotal: rhoItem.get('PrecioTotal'),
            PrecioUnitario: rhoItem.get('PrecioUnitario'),
            SIT: rhoItem.get('SIT'),
            TipoDocumento: rhoItem.get('TipoDocumento'),
            TipoVenta: rhoItem.get('TipoVenta'),
            Enviado: rhoItem.get('Enviado'),
            Espontaneo: parseBool(rhoItem.get('Espontaneo')),
            Bloqueado: rhoItem.get('Bloqueado'),
            CantidadPedida: rhoItem.get('CantidadPedida'),
            CodigoCamion: rhoItem.get('CodigoCamion'),
            CodigoChofer: rhoItem.get('CodigoChofer'),
            CodigoSector: rhoItem.get('CodigoSector'),
            CodigoTransporte: rhoItem.get('CodigoTransporte'),
            CodigoStatusPedido: rhoItem.get('CodigoStatusPedido'),
            CondicionPago: rhoItem.get('CondicionPago'),
            IndPedidos: rhoItem.get('IndPedidos'),
            Observacion: rhoItem.get('Observacion'),
            Region: rhoItem.get('Region'),
            Ruta: rhoItem.get('Ruta'),
            Zona: rhoItem.get('Zona'),
            DireccionDestinatario: rhoItem.get('DireccionDestinatario'),
            FechaEntrega: rhoItem.get('FechaEntrega'),
            NombreDestinatario: rhoItem.get('NombreDestinatario'),
            Localidad: rhoItem.get('Localidad'),
            CodigoTipoCliente: rhoItem.get('CodigoTipoCliente'),
            PorcentajeInicial: rhoItem.get("PorcentajeInicial"),
            PorcentajeFinal: rhoItem.get("PorcentajeFinal"),
            Observaciones: rhoItem.get("Observaciones")
        };
    };


    return factory;
});

factoriesModule.factory('PlantaFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('Planta');

    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        return this.toHash(rhoItem);
    };
    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.update = function (codigo, attributes) {
        var rhoItem = ormModel.find('first', {conditions: {'Codigo': codigo}});
        rhoItem.updateAttributes(attributes);
    }

    factory.getElement = function(codigoPlanta){
        var rhoItems = ormModel.find('all');
        if(rhoItems.length > 0){
            for (var i = rhoItems.length - 1; i >= 0; i--) {
                if(this.toHash(rhoItems[i]).Codigo == codigoPlanta){
                    return this.toHash(rhoItems[i]);
                }
            };
        }
        return null;
    }

    factory.getAll = function () {
        var rhoItems = ormModel.find('all');
        var temp = [];
        if (rhoItems.length > 0) {
        for (var i = rhoItems.length - 1; i >= 0; i--) {
                temp.push(this.toHash(rhoItems[i]));
            }            
        }
        return temp;
    };

    factory.toHash = function (rhoItem) {
        return {
            object: rhoItem.object(),
            Codigo: rhoItem.get('Codigo'),
            Descripcion: rhoItem.get('Descripcion'),
            Tipo: rhoItem.get('Tipo'),
            Estado: rhoItem.get('Estado'),
            Ind_Planta: rhoItem.get('Ind_Planta')
        };
    };

    return factory;
});

factoriesModule.factory('MovimientoFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('Movimiento');

    factory.deleteAll = function () {
        var rhoItems = ormModel.find('all');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
        };

    factory.select = function (column, conditionsParam) {
        return ormModel.find('all', {
            select: [column],
            conditions: conditionsParam
        });
    };

    factory.getNotSent = function () {
        var resultado = [];
        var rhoItems = ormModel.find("all", {conditions: {"Enviado": 0}});
        if (rhoItems && rhoItems.length > 0) {
            for (var i = 0; i < rhoItems.length; i++) {
                resultado.push(this.toHash(rhoItems[i]));
            }
        }

        return resultado;
    };

    factory.create = function (data) {
        var rhoItem = ormModel.create(data);
        return this.toHash(rhoItem);
    }

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            Id: rhoItem.get('Id'),
            Ajuste: rhoItem.get('Ajuste'),
            Arrastre: rhoItem.get('Arrastre'),
            CodigoPlanta: rhoItem.get('CodigoPlanta'),
            DiferenciaVenta: rhoItem.get('DiferenciaVenta'),
            Estado: rhoItem.get('Estado'),
            Fecha: rhoItem.get('Fecha'),
            Hora: rhoItem.get('Hora'),
            Km: rhoItem.get('Km'),
            Latitud: rhoItem.get('Latitud'),
            Longitud: rhoItem.get('Longitud'),
            NotaTranslado: rhoItem.get('NotaTranslado'),
            Retorno: rhoItem.get('Retorno'),
            TipoProceso: rhoItem.get('TipoProceso'),
            Enviado: rhoItem.get('Enviado'),
            NumeroDocumento: rhoItem.get('NumeroDocumento')
        };
    };

    return factory;

});

factoriesModule.factory('CargaFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('Carga');

    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    }

    factory.select = function (column, conditionsParam) {
        return ormModel.find('all', {
            select: [column],
            conditions: conditionsParam
        });
    }

    factory.getNotSent = function () {
        var resultado = [];
        var rhoItems = ormModel.find("all", {conditions: {"Enviado": 0}});
        if (rhoItems && rhoItems.length > 0) {
            for (var i = 0; i < rhoItems.length; i++) {
                resultado.push(this.toHash(rhoItems[i]));
            }
        }

        return resultado;
    };

    factory.create = function (data) {
        var rhoItem = ormModel.create(data);
        return this.toHash(rhoItem);
    };


    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            Id: rhoItem.get('Id'),
            CodigoPlanta: rhoItem.get('CodigoPlanta'),
            Densidad: rhoItem.get('Densidad'),
            Estado: rhoItem.get('Estado'),
            Enviado: rhoItem.get('Enviado'),
            Fecha: rhoItem.get('Fecha'),
            Hora: rhoItem.get('Hora'),
            KgAbastecidos: rhoItem.get('KgAbastecidos'),
            Kilometraje: rhoItem.get('Kilometraje'),
            Latitud: rhoItem.get('Latitud'),
            Longitud: rhoItem.get('Longitud'),
            NotaTraslado: rhoItem.get('NotaTraslado'),
            NumeroDocumento: rhoItem.get('NumeroDocumento'),
            PesoInicial: rhoItem.get('PesoInicial'),
            TipoProceso: rhoItem.get('TipoProceso')
        };
    };

    return factory;
});

factoriesModule.factory('MedioPagoFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('MedioPago');

    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.select = function (column, conditionsParam) {
        return ormModel.find('all', {
            select: [column],
            conditions: conditionsParam
        });
    };

    factory.create = function (data) {
        var rhoItem = ormModel.create(data);
        return this.toHash(rhoItem);
    };

    factory.getAll = function () {
        var rhoItems = ormModel.find('all');
        var temp = [];
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            temp.push(this.toHash(rhoItems[i]))
        }
        return temp;
    };

    factory.toHash = function (rhoItem) {
        return {
            object: rhoItem.object(),
            codigoMedioPago: rhoItem.get('CodigoMedioPago'),
            descripcion: rhoItem.get('Descripcion'),
            estado: rhoItem.get('Estado')
        };
    };

    return factory;
});

factoriesModule.factory('PagoFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('Pago');

    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.select = function (column, conditionsParam) {
        return ormModel.find('all', {
            select: [column],
            conditions: conditionsParam
        });
    };

    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        return this.toHash(rhoItem);
    };

    factory.getAll = function () {
        var rhoItems = ormModel.find('all');
        var temp = [];
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            temp.push(this.toHash(rhoItems[i]))
        }
        return temp;
    };

    factory.getCobranzas = function () {
        var resultado = [];
        var rhoItems = ormModel.find("all", {conditions: {"Enviado": 0,"Transaccion": 4}});
        if (rhoItems && rhoItems.length > 0) {
            for (var i = 0; i < rhoItems.length; i++) {
                resultado.push(this.toHash(rhoItems[i]));
            }
        }

        return resultado;
    };

    factory.getNotSent = function () {
        var resultado = [];
        var rhoItems = ormModel.find("all", {conditions: {"Enviado": 0}});
        if (rhoItems && rhoItems.length > 0) {
            for (var i = 0; i < rhoItems.length; i++) {
                resultado.push(this.toHash(rhoItems[i]));
            }
        }

        return resultado;
    };

    factory.getByNumeroPedido = function (numeroPedido) {
        var resultado = [];
        var rhoItems = ormModel.find('all', {conditions: {NumeroPedido: numeroPedido}});
        if (rhoItems && rhoItems.length > 0) {
            for (var i = 0; i < rhoItems.length; i++) {
                resultado.push(this.toHash(rhoItems[i]));
            }
        }

        return resultado;
    };

    factory.toHash = function (rhoItem) {
        return {
            object: rhoItem.object(),
            rhoItem: rhoItem,
            banco: rhoItem.get('Banco'),
            centroAbastecedor: rhoItem.get('CentroAbastecedor'),
            codigoAutorizacion: rhoItem.get('CodigoAutorizacion'),
            codigoCliente: rhoItem.get('CodigoCliente'),
            cuotas: rhoItem.get('Cuotas'),
            cupon: rhoItem.get('Cupon'),
            estado: rhoItem.get('Estado'),
            fecha: rhoItem.get('Fecha'),
            fechaVencimiento: rhoItem.get('FechaVencimiento'),
            hora: rhoItem.get('Hora'),
            ID: rhoItem.get('ID'),
            latitud: rhoItem.get('Latitud'),
            longitud: rhoItem.get('Longitud'),
            medioPago: rhoItem.get('MedioPago'),
            monto: rhoItem.get('Monto'),
            numeroIdentificador: rhoItem.get('NumeroIdentificador'),
            numeroPedido: rhoItem.get('NumeroPedido'),
            tipo: rhoItem.get('Tipo'),
            transaccion: rhoItem.get('Transaccion'),
            enviado: rhoItem.get('Enviado')
        };
    };

    return factory;
});

factoriesModule.factory('DatosServiciosFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('DatosServicios');

    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.create = function (data) {
        var rhoItem = ormModel.create(data);
        return this.toHash(rhoItem);
    };

    factory.getAll = function () {
        var elems = ormModel.find('all');
        var results = [];
        for (var i = elems.length - 1; i >= 0; i--) {
            results.push(this.toHash(elems[i]));
        }
        return results;
    };

    factory.getElement = function () {
        return this.toHash(ormModel.find('first', {
            conditions: {ID: '1'}
        }));
    };

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            AdminAllow: rhoItem.get('AdminAllow'),
            Carpeta: rhoItem.get('Carpeta'),
            ID: rhoItem.get('ID'),
            IpServer: rhoItem.get('IpServer'),
            Porcentaje: rhoItem.get('Porcentaje')
        };
    };

    return factory;
});

factoriesModule.factory('BancoFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('Banco');

    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        return this.toHash(rhoItem);
    };
    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.getAll = function () {
        var rhoItems = ormModel.find('all');
        var temp = [];
        if (rhoItems.length > 0) {
            for (var i = rhoItems.length - 1; i >= 0; i--) {
                temp.push(this.toHash(rhoItems[i]));
            }
        }
        return temp;
    };

    factory.toHash = function (rhoItem) {
        return {
            object: rhoItem.object(),
            rhoItem: rhoItem,
            codigoBanco: rhoItem.get('Codigo'),
            descripcionBanco: rhoItem.get('Descripcion'),
            estadoBanco: rhoItem.get('Estado'),
            fechaCreacion: rhoItem.get('FechaCreacion'),
            indBanco: rhoItem.get('Id')
        };
    };

    return factory;
});

factoriesModule.factory('TipoMedioPagoFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('TipoMedioPago');

    factory.create = function (params) {
        var rhoItem = ormModel.create(params);
        return this.toHash(rhoItem);
    };
    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.update = function (codigo, attributes) {
        var rhoItem = ormModel.find('first', {conditions: {'Codigo': codigo}});
        rhoItem.updateAttributes(attributes);
    }

    factory.getAll = function () {
        var rhoItems = ormModel.find('all');
        var temp = [];
        if (rhoItems.length > 0) {
            for (var i = rhoItems.length - 1; i >= 0; i--) {
                temp.push(this.toHash(rhoItems[i]));
            }
        }
        return temp;
    };

    factory.getTiposPorMedioPago = function (codigoMedioPago) {
        var rhoItems = ormModel.find('all', {conditions: {'CodigoMedioPago':codigoMedioPago}});
        var temp = [];
        if (rhoItems.length > 0) {
            for (var i = rhoItems.length - 1; i >= 0; i--) {
                temp.push(this.toHash(rhoItems[i]));
            }
        }
        return temp;
    };

    factory.toHash = function (rhoItem) {
        return {
            object: rhoItem.object(),
            rhoItem: rhoItem,
            codigoMedioPago: rhoItem.get('CodigoMedioPago'),
            codigo: rhoItem.get('Codigo'),
            descripcion: rhoItem.get('Descripcion'),
            estado: rhoItem.get('Estado')
        };
    };

    return factory;
});

factoriesModule.factory('MotivoFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('Motivo');

    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.create = function (data) {
        var rhoItem = ormModel.create(data);
        return this.toHash(rhoItem);
    };

    factory.getAll = function () {
        var elems = ormModel.find('all');
        var results = [];
        for (var i = elems.length - 1; i >= 0; i--) {
            results.push(this.toHash(elems[i]));
        }
        return results;
    };

    factory.getMotivoParaBloqueado = function(){
        var resultado = [];
        var rhoItems = ormModel.find('all', {conditions: {Id: '47'}});
        if (rhoItems && rhoItems.length > 0) {
            for (var i = 0; i < rhoItems.length; i++) {
                resultado.push(this.toHash(rhoItems[i]));
            }
        }
        return resultado;
    };

    factory.getElement = function(codigoPlanta){
        var rhoItems = ormModel.find('all');
        if(rhoItems.length > 0){
            for (var i = rhoItems.length - 1; i >= 0; i--) {
                if(this.toHash(rhoItems[i]).id == codigoPlanta){
                    return this.toHash(rhoItems[i]);
                }
            };
        }
        return null;
    }

    factory.update = function (codigo, attributes) {
        var rhoItem = ormModel.find('first', {conditions: {'Id': codigo}});
        rhoItem.updateAttributes(attributes);
    }

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            id: rhoItem.get('Id'),
            descripcion: rhoItem.get('Descripcion')
        };
    };

    return factory;
});

factoriesModule.factory('RegionFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('Region');

    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.create = function (data) {
        var rhoItem = ormModel.create(data);
        return this.toHash(rhoItem);
    };

    factory.getAll = function () {
        var elems = ormModel.find('all');
        var results = [];
        for (var i = elems.length - 1; i >= 0; i--) {
            results.push(this.toHash(elems[i]));
        }
        ;
        return results;
    };

    factory.getElement = function () {
        return this.toHash(ormModel.find('first', {
            conditions: {Codigo: '1'}
        }));
    };

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            Codigo: rhoItem.get('Codigo'),
            Descripcion: rhoItem.get('Descripcion'),
            Estado: rhoItem.get('Estado'),
            FechaCreacion: rhoItem.get('FechaCreacion'),
            CodigoPais: rhoItem.get('CodigoPais')
        };
    };

    return factory;
});

factoriesModule.factory('CondicionPagoFactory', function () {
    var factory = {};
    var ormModel = Rho.ORM.getModel('CondicionPago');
    
    factory.deleteAll = function () {
        var rhoItems = ormModel.find('All');
        for (var i = rhoItems.length - 1; i >= 0; i--) {
            var rhoItem = rhoItems[i];
            rhoItem.destroy();
        }
    };

    factory.create = function (data) {
        var rhoItem = ormModel.create(data);
        return this.toHash(rhoItem);
    };

    factory.getAll = function () {
        var elems = ormModel.find('all');
        var results = [];
        for (var i = elems.length - 1; i >= 0; i--) {
            results.push(this.toHash(elems[i]));
        }
        return results;
    };

    factory.getElement = function(data){
        var rhoItem = ormModel.find('first', {
            conditions:{
                Codigo: data
            }
        });
        if(rhoItem != undefined && rhoItem != null){
            return this.toHash(rhoItem);
        }
        return null;
    };

    factory.toHash = function (rhoItem) {
        return {
            rhoItem: rhoItem,
            object: rhoItem.object(),
            Codigo: rhoItem.get('Codigo'),
            Descripcion: rhoItem.get('Descripcion'),
            Estado: rhoItem.get('Estado'),
            Fecha: rhoItem.get('Fecha'),
            Indice: rhoItem.get('Indice')
        };
    };

    return factory;
});

//factoriesModule.factory(
//    "stacktraceService",
//    function() {
//        // "printStackTrace" is a global object.
//        return({
//            print: printStackTrace
//        });
//    }
//);
//
//factoriesModule.provider(
//    "$exceptionHandler",
//    {
//        $get: function( errorLogService ) {
//            return( errorLogService );
//        }
//    }
//);
//
//factoriesModule.factory(
//    "errorLogService",
//    function( $log, $window, stacktraceService ) {
//        // I log the given error to the remote server.
//        function log( exception, cause ) {
//            // Pass off the error to the default error handler
//            // on the AngualrJS logger. This will output the
//            // error to the console (and let the application
//            // keep running normally for the user).
//            $log.error.apply( $log, arguments );
//            // Now, we need to try and log the error the server.
//            // --
//            // NOTE: In production, I have some debouncing
//            // logic here to prevent the same client from
//            // logging the same error over and over again! All
//            // that would do is add noise to the log.
//            try {
//                var errorMessage = exception.toString();
//                var stackTrace = stacktraceService.print({ e: exception });
//                // Log the JavaScript error to the server.
//                // --
//                // NOTE: In this demo, the POST URL doesn't
//                // exists and will simply return a 404.
//                //$.ajax({
//                //    type: "POST",
//                //    url: "./javascript-errors",
//                //    contentType: "application/json",
//                //    data: angular.toJson({
//                //        errorUrl: $window.location.href,
//                //        errorMessage: errorMessage,
//                //        stackTrace: stackTrace,
//                //        cause: ( cause || "" )
//                //    })
//                //});
//
//                //$log.info( stackTrace );
//
//            } catch ( loggingError ) {
//                // For Developers - log the log-failure.
//                $log.warn( "Error logging failed" );
//                $log.log( loggingError );
//            }
//        }
//        // Return the logging function.
//        return( log );
//    }
//);

//factoriesModule.factory('ServicioSync', function($http, $timeout) {
//    var data = { response: {}, calls: 0 };
//    var poller = function() {
//        $http.get('data.json').then(function(r) {
//            data.response = r.data;
//            data.calls++;
//            $timeout(poller, 1000);
//        });
//
//    };
//    poller();
//
//    return {
//        data: data
//    };
//});