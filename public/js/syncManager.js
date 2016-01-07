/****************************************************
 *                                                   *
 *              By Uberall Corporation S.A.          *
 *                  Date: 06/26/2015                 *
 * Summary: This class will handle all the syncroni_ *
 *  zation with Total's Back-End.                    *
 *                                                   *
 *****************************************************/
var syncManager;
syncManager = (function () {

    var userName;
    var password;
    var idpda;
    var ntr;
    var rootScopeLocal;
    var stateLocal;

    //SETUP Factories
    var PedidosFactory;
    var ClientesFactory;
    var GPSFactory;
    var TIAPDAFactory;
    var UDFactory;
    var MovimientoFactory;
    var CargaFactory;
    var EntregaFactory;
    var PagoFactory;
    var PlantaFactory;
    var TipoMedioPagoFactory
    var MotivoFactory
    ///FIN SETUP

    //SETUP DATOS
    var loginUser;
    var loginPass;
    var userCompleteName;
    var version;
    var loginType;
    var transportNumber;
    var systemDate;
    //FIN SETUP DATOS

    function actualizacionTablasParametricas(argument) {
        //Proceso las Plantas
        argument.find("Planta").each(function(){
            //Me fijo si la planta existe.
            $planta = PlantaFactory.getElement($(this).find("Codigo_Planta").text());
            $elem = {
                    Codigo:$(this).find("Codigo_Planta").text(),
                    Descripcion: $(this).find("Descripcion_Planta").text(),
                    Tipo: $(this).find("tipo_planta").text(),
                    Estado: $(this).find("Estado_Planta").text(),
                    Ind_Planta: $(this).find("Ind_Planta").text()
                };
            if($planta == null || $planta == undefined){
                //La planta no existe entonces la agrego a la DB.
                PlantaFactory.create($elem);
            }else{
                //La planta ya existe entonces tengo que hacer un update de la DB.
                PlantaFactory.update($(this).find("Codigo_Planta").text(), $elem);
            }
        });
        
        //Proceso los Tipos de Medios de pagos
        argument.find("Tipo_Medio_Pago").each(function(){
            //Me fijo si el tipo de medio de pago existe.
            $tipoMediosPago = TipoMedioPagoFactory.getTiposPorMedioPago($(this).find("Codigo_TipoMedio_Pago").text());
            $elem = {
                    Codigo:$(this).find("Codigo_TipoMedio_Pago").text(),
                    CodigoMedioPago: $(this).find("Codigo_Medio_Pago").text(),
                    Descripcion: $(this).find("Descripcion").text(),
                    Estado: $(this).find("Estado").text()
                };
            //Si existe el tipoMedioPago
            if($tipoMediosPago.length <= 0){
                //La planta no existe entonces la agrego a la DB.
                TipoMedioPagoFactory.create($elem);
                console.log("Tipo Medio de pago fue creado correctamente.");
            }else{
                //La planta ya existe entonces tengo que hacer un update de la DB.
                TipoMedioPagoFactory.update($(this).find("Codigo_TipoMedio_Pago").text(), $elem);
                console.log("Tipo Medio de pago fue actualizado correctamente.");
            }
        });

        //Proceso los Motivos de Entrega
        argument.find("Motivo").each(function(){
            //Me fijo si el motivo de entrega existe.
            $MotivoEntrega = MotivoFactory.getElement($(this).find("IdMotivo").text());
            $elem = {
                    Id:$(this).find("IdMotivo").text(),
                    Descripcion: $(this).find("DescMotivo").text()
                };
            //Si existe el Motivo de Entrega
            if($MotivoEntrega == null || $MotivoEntrega == undefined){
                //El Motivo no existe entonces la agrego a la DB.
                MotivoFactory.create($elem);
                console.log("Tipo Medio de pago fue creado correctamente.");
            }else{
                //El Motivo ya existe entonces tengo que hacer un update de la DB.
                MotivoFactory.update($(this).find("IdMotivo").text(), $elem);
                console.log("Tipo Medio de pago fue actualizado correctamente.");
            }
        });
    }

    function descargarNuevaAppCallback($state){
        $state.go('app.descarga');
    }

    function sendACKPedidos() {
        var pedidosAConfirmar = PedidosFactory.getPendientesDeConfirmacion();

        if (pedidosAConfirmar.length > 0) {
            data = "";

            for (var i = 0; i < pedidosAConfirmar.length; i++) {
                var pedido = pedidosAConfirmar[i];
                if (pedido) {
                    if (i == pedidosAConfirmar.length - 1) {
                        data += String.format("{0}{1}|0U", pedido.Revision, pedido.NumeroPedido);
                    } else {
                        data += String.format("{0}{1}|", pedido.Revision, pedido.NumeroPedido);
                    }
                }
            }

            //Envair al servidor
            $url = 'http://' + configs.ipServidor + configs.direccionServicios + '/' + TipoServicioMCL.Services + '.aspx?';
            $queryString = 'tr=resp' + '&user=' + userName + '&pass=' + password + '&ntr=' + ntr + '&idpda=' + idpda + "&dat=" + data;
            $.ajax({
                type: "GET",
                url: $url + $queryString,
                success: function () {
                    for (var i = 0; i < pedidosAConfirmar.length; i++) {
                        var pedido = pedidosAConfirmar[i];
                        if (pedido) {
                            pedido.rhoItem.updateAttributes({ACK: 1});
                        }
                    }
                },
                error: function (e) {
                    console.log(e.message);
                    console.log(e);
                }
            });
        }
    }

    function cerrar_pda(){
        //Update TIAPDA.
        TIAPDAFactory.update({Estado:0});
        
        //Delete all.
        MovimientoFactory.deleteAll();
        EntregaFactory.deleteAll();
        CargaFactory.deleteAll();
        ClientesFactory.deleteAll();
        PedidosFactory.deleteAll();
        PagoFactory.deleteAll();

        //Reset login start state.
        $workflowInit = 0;
    }


    function sendACKClientes(successCallback) {
        var clientesAConfirmar = ClientesFactory.getPendientesDeConfirmacion();

        if (clientesAConfirmar.length > 0) {
            var data = "";

            for (var i = 0; i < clientesAConfirmar.length; i++) {
                var cliente = clientesAConfirmar[i];
                if (cliente) {
                    if (i == clientesAConfirmar.length - 1) {
                        data += String.format("{0}|0U", cliente.codigoCliente);
                    } else {
                        data += String.format("{0}|", cliente.codigoCliente);
                    }
                }
            }

            //Envair al servidor
            $url = 'http://' + configs.ipServidor + configs.direccionServicios + '/' + TipoServicioMCL.ServCliente2010 + '.aspx?';
            $queryString = 'tp=res' + '&user=' + userName + '&pass=' + password + '&ntr=' + ntr + '&idpda=' + idpda + "&ver=" + configs.appVersion + "&dat=" + data;
            $.ajax({
                type: "GET",
                url: $url + $queryString,
                success: function () {
                    for (var i = 0; i < clientesAConfirmar.length; i++) {
                        var cliente = clientesAConfirmar[i];
                        if (cliente) {
                            cliente.rhoItem.updateAttributes({ACK: 1});
                        }
                    }

                    $url2 = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.ServCliente2010 + '.aspx?';
                    $queryString2 = 'tp=env' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&ntr=' + ntr + '&ver=' + configs.appVersion + '&dat=';
                    $.ajax({
                        type: "GET",
                        url: $url2 + $queryString2,
                        success: function(data){

                            var clientes = data.split('¡');
                            if(clientes[0] != "0#NOOK"){
                                //syncManager.getClientes(function (msg) {
                                //    console.log(msg);//Pedido de clientes terminado
                                //});
                                procesarRespuestaClientes(data,successCallback);
                            }else{
                                successCallback("Actualizacion de clientes realizada");
                            }
                        },

                        error: function (e) {
                            console.log(e.message);
                            console.log(e);
                        }
                    });



                },
                error: function (e) {
                    console.log(e.message);
                    console.log(e);
                }
            });
        }

    }

    function procesarRespuestaPedidos(data, successCallBack) {
        var nuevos = 0;
        var splittedData = data.split('¡')[0].split('#');
        var cantPedidos = splittedData[0];
        var cancelados = 0;
        if(splittedData.length > 1){
             cancelados = splittedData[1];            
        }
        if (cantPedidos > 0 || cancelados.length > 0) {
            var pedidosRaw = splittedData[1].split('!');

            pedidosRaw.forEach(function (pedidoData, index, pedidosRaw) {
                if(pedidoData != ''){
                var pedidoValues = pedidoData.split('|');
                if (pedidoValues[0] === 'CAN' || pedidoValues[0] === 'REC') {

                    if (pedidoValues[0] === 'CAN') {
                        for (var iCancelados = 1; iCancelados < pedidoValues.length; iCancelados++) {
                            var pedido = PedidosFactory.findById(pedidoValues[iCancelados]);
                            if (pedido) {
                                pedido.Reclamo = 'C';//Modificación instancia actual, no impacata en DB
                                pedido.rhoItem.updateAttributes({
                                    Reclamo: pedido.Reclamo,
                                    ACK: 0,
                                    Revision: 'C'
                                });//Actualizacion modelo en DB
                            }
                        }
                    } else if (pedidoValues[0] === 'REC') {
                        for (var iReclamos = 1; iReclamos < pedidoValues.length; iReclamos++) {
                            var pedido = PedidosFactory.findById(pedidoValues[iReclamos]);
                            if (pedido) {
                                pedido.Reclamo = 'R';//Modificación instancia actual, no impacata en DB
                                pedido.rhoItem.updateAttributes({
                                    Reclamo: pedido.Reclamo,
                                    ACK: 0,
                                    Revision: 'R'
                                });//Actualizacion modelo en DB
                            }
                        }
                    }
                } else {
                    if(pedidoValues[0] !== 'cert'){                        
                        //Checkeo existencia
                        var pedido = PedidosFactory.findById(pedidoValues[2]);
                        if (pedido) {
                            //Chequeo si está bloqueado
                            if (pedido.Bloqueado === 'X') {
                                pedido.Bloqueado = '';//Se desbloquea el pedido
                                pedido.rhoItem.updateAttributes({
                                    Bloqueado: pedido.Bloqueado,
                                    ACK: 0,
                                    Revision: ''
                                });//Actualizacion modelo en DB
                            } else {
                                //Los pedidos no se actualizan
                            }
                        } else {
                            //Crear pedido
                            PedidosFactory.create({
                                Codigo_Sector: pedidoValues[0],
                                CodigoStatusPedido: '2',
                                NumeroPedido: pedidoValues[2],
                                NumeroPedidoCRM: pedidoValues[3],
                                Codigo_Cliente: pedidoValues[4],
                                Nombre_Cliente: pedidoValues[5],
                                Nombre_Destinatario: pedidoValues[6],
                                Direccion_Destinatario: pedidoValues[7],
                                Bloqueado: pedidoValues[8],
                                Cond_Pago: pedidoValues[9],
                                Fecha_Entrega: pedidoValues[10],
                                Region: pedidoValues[11],
                                Localidad: pedidoValues[12],
                                Ruta: pedidoValues[13],
                                IVA: pedidoValues[14].replace(',', '.'),
                                Percep_IVA: pedidoValues[15].replace(',', '.'),
                                IIBB: pedidoValues[16].replace(',', '.'),
                                Observacion: pedidoValues[17],
                                Zona: pedidoValues[18],
                                Codigo_Transporte: pedidoValues[19],
                                Codigo_Camion: pedidoValues[20],
                                Codigo_Chofer: pedidoValues[21],
                                Estado_Pedido: pedidoValues[22],
                                Latitud: pedidoValues[23],
                                Longitud: pedidoValues[24],
                                Cantidad_Pedida: pedidoValues[25].replace(',', '.'),
                                Precio: pedidoValues[26].replace(',', '.'),
                                CodigoTipoCliente: pedidoValues[27],
                                Cuit: pedidoValues[28],
                                Autorizacion: pedidoValues[29],
                                Prioridad: pedidoValues[30],
                                Reclamo: '',
                                ACK: 0
                            });

                            nuevos++;
                        }
                    }
                }
                }
                
            });

            sendACKPedidos();
            if(stateLocal.current.name === 'app.agenda'){
                //Se relodea la agenda si hay nuevos pedidos.
                console.log("Estoy en la agenda entonces tengo que relodear el estado.");
                rootScopeLocal.recuperarPedidos();
                //stateLocal.go(stateLocal.current, {}, {reload: 'child.state'});
            }
            console.log("Debería estar funcionando con los nuevos pedidos.");

            successCallBack(nuevos);
        }else{
            successCallBack(0);
        }
    }

    function procesarRespuestaClientes(data,successCallback) {
        var splittedData = data.split('¡')[0].split('#');
        var cantClientes = splittedData[0];
        if (cantClientes > 0) {

            var clientesRaw = splittedData[1].split('!');

            clientesRaw.forEach(function (clienteData, index, clientesRaw) {
                var clienteValues = clienteData.split('|');

                var cliente = ClientesFactory.findById(clienteValues[0]);

                if (cliente) {
                    cliente.rhoItem.updateAttributes({
                        CodigoCliente: clienteValues[0],
                        Codigo_Destinatario: clienteValues[1],
                        NombreCliente: clienteValues[2],
                        Calle: clienteValues[3],
                        Poblacion: clienteValues[4],
                        Pais: clienteValues[5],
                        Codigo_Postal: clienteValues[6],
                        Region: clienteValues[7],
                        Telefono: clienteValues[8],
                        NIF: clienteValues[9],
                        Estado_SAP: clienteValues[10],
                        Sector: clienteValues[11],
                        Condicion_Pago: clienteValues[12],
                        Direccion_Entrega: clienteValues[13],
                        Material: clienteValues[14],
                        Precio: clienteValues[15],
                        IVA: clienteValues[16],
                        PI: clienteValues[17],
                        PIB: clienteValues[18],
                        Zona: clienteValues[19],
                        Codigo_ºa: clienteValues[20],
                        Estado_Cliente: clienteValues[21],
                        Tipo_Cliente: clienteValues[22],
                        Codigo_TipoCliente: clienteValues[23],
                        Codigo_EstadoSAP: clienteValues[24],
                        Transporte: clienteValues[25],
                        Localidad: clienteValues[26],
                        Cuit: clienteValues[27],
                        Latitud: clienteValues[28],
                        Longitud: clienteValues[29],
                        Autorizacion: clienteValues[30],
                        ACK: 0
                    });
                } else {
                    ClientesFactory.create({
                        CodigoCliente: clienteValues[0],
                        Codigo_Destinatario: clienteValues[1],
                        NombreCliente: clienteValues[2],
                        Calle: clienteValues[3],
                        Poblacion: clienteValues[4],
                        Pais: clienteValues[5],
                        Codigo_Postal: clienteValues[6],
                        Region: clienteValues[7],
                        Telefono: clienteValues[8],
                        NIF: clienteValues[9],
                        Estado_SAP: clienteValues[10],
                        Sector: clienteValues[11],
                        Condicion_Pago: clienteValues[12],
                        Direccion_Entrega: clienteValues[13],
                        Material: clienteValues[14],
                        Precio: clienteValues[15],
                        IVA: clienteValues[16],
                        PI: clienteValues[17],
                        PIB: clienteValues[18],
                        Zona: clienteValues[19],
                        Codigo_Planta: clienteValues[20],
                        Estado_Cliente: clienteValues[21],
                        Tipo_Cliente: clienteValues[22],
                        Codigo_TipoCliente: clienteValues[23],
                        Codigo_EstadoSAP: clienteValues[24],
                        Transporte: clienteValues[25],
                        Localidad: clienteValues[26],
                        Cuit: clienteValues[27],
                        Latitud: clienteValues[28],
                        Longitud: clienteValues[29],
                        Autorizacion: clienteValues[30],
                        ACK: 0
                    });
                }
            });

            sendACKClientes(successCallback);

            //successCallback("Actualizacion de clientes realizada");
        }else{
            successCallback("Nada que actualizar");
        }
    }

    function checkPedidosAbiertos(argument) {
        var entregas = EntregaFactory.getNotSent();
        if(entregas.length > 0){
            return false;
        }
        return true;
    }

    function updateDatosUsuario($scope, $rootScope, userName, transportNumber, systemDate) {
        var item = UDFactory.selectItem({ID: '1'});
        if (item.length > 0) {
            item.updateAttributes({
                Usuario: $scope.loginUser.username,
                Password: $scope.loginUser.password,
                Nombre: userName,
                IDPDA: $rootScope.phoneUUID,
                HR: transportNumber,
                Fecha: systemDate
            });
        }
    }

    function loginConnectionCallback(data) {
        if (data['connectionTypeConnected'] != 'Not Connected') {
            $state.go('app.datosInicio');
        } else {
            showAlert('Total Argentina', 'No Existe conexion');
        }
    }

    var manager = {
        setup: function (params) {
            PedidosFactory = params["PedidosFactory"];
            ClientesFactory = params["ClientesFactory"];
            GPSFactory = params["GPSFactory"];
            TIAPDAFactory = params["TIAPDAFactory"];
            UDFactory = params["UDFactory"];
            MovimientoFactory = params["MovimientoFactory"];
            CargaFactory = params["CargaFactory"];
            EntregaFactory = params["EntregaFactory"];
            PagoFactory = params["PagoFactory"];
            PlantaFactory = params["PlantaFactory"];
            TipoMedioPagoFactory = params["TipoMedioPagoFactory"];
            MotivoFactory = params["MotivoFactory"];
            rootScopeLocal = params["rootScope"];
            stateLocal = params["state"];
        },
        setupDatos: function(params){
            userName = params['loginUser'];
            password = params['loginPass'];
            userCompleteName = params['username'];
            loginType = params['loginTypeParam'];
            version = params['versionParam'];
            systemDate = params['systemDateParam'];
            ntr = params['transportNumberParam'];
            idpda = params['phoneUUID'];
        },
        getDatosUsuario: function(){
            return {
                username: userName,
                password: password,
                nombre: userCompleteName,
                loginType: loginType,
                version: version,
                systemDate: systemDate,
                ntr: ntr,
                idpda: idpda
            };
        },
		firstSync : function ($scope, $rootScope, $state, $ionicLoading, user, loginType, version, transportNumber, systemDate) {
            this.setupDatos({
                loginUser: $scope.loginUser.username,
                loginPass: $scope.loginUser.password,
                username: user,
                loginTypeParam: loginType,
                versionParam: version,
                systemDateParam: systemDate,
                transportNumberParam: transportNumber,
                phoneUUID: $rootScope.phoneUUID
            });

			if(Rho.Network.hasNetwork()){
			    if($rootScope.workflowInit == true){
	                if($loginType == "GRN"){
	                    if($version == configs['appVersion']){
							var tiapdaItem = TIAPDAFactory.select('Estado', {ID:'1'});
                            //Actualizacion de tablas parametricas.
                            $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL['Actualizacion'] + '.aspx?';
                            $queryString = 'user=' + $scope.loginUser.username + '&pass=' + $scope.loginUser.password + '&var=' + configs['appVersion'] + '&idpda=' + $rootScope.phoneUUID;
                            $.ajax({
                                type: "GET",
                                url: $url + $queryString,
                                async: false,
                                success: function (data) {
                                    $ionicLoading.hide();
                                    var response = data.split('|');
                                    if (response[0] == 'Error') {
                                        console.log('Error al intentar actualizar las tablas paramétricas');
                                    } else if (response[0] == 'Empty') {
                                        console.log('No hay actualizacion de tablas paramétricas');
                                    } else {
                                        console.log('Hay nuevas plantas. Las mismas seran actualizadas.');
                                        var xml = response[2];
                                        xmlDoc = $.parseXML(xml);
                                        $xml = $(xmlDoc);                                        
                                        actualizacionTablasParametricas($xml);
                                    }
                                },
                                error: function () {
                                    $ionicLoading.hide();
                                    console.log('Error Get tables PDA.');
                                }
                            });
							if(checkPedidosAbiertos){
								if(tiapdaItem.Estado == '0'){

                                    $rootScope.startSyncroService();
                                    
                                    $state.go('app.datosInicio');
                                } else {
                                    //TODO: Revisar VerificacionPendienteEnvios()
                                    //En caso de que haya cambiando dentro de la funcion anterior
									tiapdaItem = TIAPDAFactory.select('Estado', {ID:'1'});
									if(tiapdaItem.Estado == '0'){

                                        $rootScope.startSyncroService();
                                        
                                        $state.go('app.datosInicio');
                                    } else {
                                        //TODO: Revisar la llamada a las funciones SyncronizacionManualItems() / SyncronizacionClinte() / ComprobacionItems()

                                        $rootScope.startSyncroService();
                                        
                                        $state.go('app.agenda');
                                    }
                                }
                            } else {
                                showAlert('Total Argentina', 'Hay un cierre de HR pendiente de envio');
                                //TODO: Revisar VerificacionPendienteEnvios()
                                //TODO: Debería volver a loggearse una vez que verificó los envíos.
                            }
                        }
						else{
							var item = TIAPDAFactory.select('Estado', {ID:'1'});
                            if(item.Estado == '0'){
                                //Ir a Descarga.
                                Rho.Notification.showPopup({
                                    title: "Total Argentina",
                                    message: 'Hay una nueva version disponible. Desea descargarla?',
                                    buttons: [{id:'cancel', title:'Cancelar'},{id:'ok', title:'Ok'}]
                                }, function(e){
                                    if(e.button_id == "ok"){
                                        descargarNuevaAppCallback($state);
                                        $ionicLoading.hide();
                                    }
                                    Rho.Notification.hidePopup();
                                    $ionicLoading.hide();
                                });
                            } else {
                                //TODO: Setear fecha
								updateDatosUsuario($scope, $rootScope, user, transportNumber, systemDate);
                                item = TIAPDAFactory.select('Estado', {ID:'1'});
								if(item.Estado == '0'){
                                    
                                    $rootScope.startSyncroService();
                                    
                                    $state.go('app.datosInicio');
                                } else {
                                    //TODO: Revisar la llamada a las funciones VerificacionPendientesEnvio() /  SyncronizacionManualItems() / SyncronizacionClinte() / ComprobacionItems()

                                    $rootScope.startSyncroService();
                                    $state.go('app.agenda');
                                    $ionicLoading.hide();
                                }
                            }
                        }
                    }
                }
            } else {
                Rho.Network.connectWan('internet', loginConnectionCallback);
            }
        },
        modoOffline: function () {
            var username = UDFactory.select('Usuario', {ID: '1'});
            var password = UDFactory.select('Password', {ID: '1'});
            var nroHojaRuta = UDFactory.select('HR', {ID: '1'});
            if (loginUser.username == username && loginUser.password == password) {
                if (checkPedidosAbiertos) {
                    showAlert('Total Argentina', 'No hay conexión y posee un cierre de HR pendiente, favor intentar más tarde.');
            	}else{
            		var item = TIAPDAFactory.select('Estado', {ID:'1'});
            		if(item.Estado == '0'){
                        showAlert('Total Argentina', 'No hay conexion, vuelva a intentar en breve');
                    } else {
                        $state.go('app.agenda');
                    }
                }
            } else {
                showAlert("Status", "Usuario o contraseña incorrectos.");
            }
        },
        getPedidos: function (successCallBack, errorCallBack) {
            //TODO Revisar cómo se maneja una actualización de una orden que ya fue procesada
            $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.Services + '.aspx?';
            $queryString = 'tr=ped' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&ntr=' + ntr;
            $.ajax({
                type: "GET",
                url: $url + $queryString,
                success: function (data) {
                    procesarRespuestaPedidos(data, successCallBack);
                },

                error: function (e) {
                    if(errorCallBack != null){
                        errorCallBack("No se pudieron recuperar pedidos");                        
                    }
                }
            });
        },
        getClientes: function (successCallback) {
            $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.ServCliente2010 + '.aspx?';
            $queryString = 'tp=env' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&ntr=' + ntr + '&ver=' + configs.appVersion + '&dat=';
            $.ajax({
                type: "GET",
                url: $url + $queryString,
                success: function(data){
                    procesarRespuestaClientes(data,successCallback);
                },

                error: function (e) {
                    console.log(e.message);
                    console.log(e);
                }
            });
        },
        testGPS: function (successCallback) {
            //GPSFactory = $gpsFactory;//TODO Reemplazar por punto de instanciación del syncmanager

            console.log("_____INICIO ENVIO GPS _____");

            var locationsToSend = GPSFactory.getNotSent();

            var locationsData = '';
            for (var i = 0; i < locationsToSend.length; i++) {

                locationsData += parseGPSToSend(locationsToSend[i]);

                if((i != 0) && (i % 50 == 0 || i == locationsToSend.length-1)){

                    console.log("----------LOCATION DATA ---------");
                    console.log(locationsData);

                    //Send
                    $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.ServGPS + '.aspx?';
                    $queryString = '&uuid=' + idpda + '&var=' + locationsData;
                    $.ajax($url + $queryString)
                        .done(function (data) {
                            if (data === 'OK')
                                console.log("all good");
                        })
                        .fail(function (e) {
                            console.log(e.message);
                            console.log(e);
                        });

                    locationsData = '';
                }
            }
            //Set as Sent
            for (var i = 0; i < locationsToSend.length; i++) {
                locationsToSend[i].rhoItem.updateAttributes({
                    Enviado: 1
                });
            }

            console.log("_____FIN ENVIO GPS _____");


            successCallback("FIN ENVIO GPS");

            /*
             CLEAR DB
             Dado que se utiliza el ID del último location para asistir con el ordenamiento de puntos en el lado
             del servidor es necesario mantener los puntos utilizados hasta que se termine de procesar la HR.
             En ese punto se puede hacer una limpieza y reiniciar el contador de Ids
             */


            /**
             * Funcion para obtener una línea de información de registro de ubicación GPS
             * para enviar al servidor
             * @param lcoation Representa el registro GPS recuperado de la BD
             */
            function parseGPSToSend(lcoation) {
                var data = String.format(
                    '{0}|{1}|{2}|{3}|{4}|{5}|{6}!',
                    lcoation.id,
                    lcoation.latitud,
                    lcoation.longitud,
                    lcoation.HR,
                    lcoation.cliente,
                    lcoation.UUID,
                    lcoation.fecha
                );
                return data;
            }

        },
        sync: function () {
            /*
                Enviar pendientes

             */
        },



        sendMovimientoCarga: function (successCallback) {
            var cargas = CargaFactory.getNotSent();

            if (cargas.length > 0) {

                var stringEnvio = "";
                var counterProcesoCarga = 0;
                for (var i = 0; i < cargas.length; i++) {
                    var carga = cargas[i];
                    if (carga.TipoProceso == TipoMovimiento.Carga) {
                        var formato = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|0U|";
                        if (i == (cargas.length - 1)) {//Si es el último
                            formato = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|0U";
                        }

                        stringEnvio += String.format(formato,
                            carga.TipoProceso,
                            carga.CodigoPlanta,
                            carga.Fecha,
                            carga.Hora,
                            carga.NumeroDocumento,
                            carga.Densidad,
                            carga.KgAbastecidos,
                            carga.Kilometraje,
                            carga.PesoInicial,
                            carga.Latitud,
                            carga.Longitud);

                        counterProcesoCarga++;
                    }
                }

                $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.Services + '.aspx?';
                $queryString = 'tr=abast' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&cp=' + counterProcesoCarga + '&ntr=' + ntr + '&dat=' + stringEnvio;
                $.ajax({
                    type: "GET",
                    url: $url + $queryString,
                    success: function (respuesta) {
                        if (respuesta === 'OK¡') {
                            for (var i = 0; i < cargas.length; i++) {
                                var carga = cargas[i];
                                if (carga.TipoProceso == TipoMovimiento.Carga) {
                                    carga.rhoItem.updateAttributes({
                                        Enviado: 1
                                    });
                                }
                            }
                        }

                        successCallback("done");
                    },
                    error: function (e) {
                        console.log(e.message);
                        console.log(e);
                    }
                });
            }else{
                successCallback("Nada que enviar");
            }

        },

        sendMovimientoRecarga: function (successCallback) {
            var movimientos = MovimientoFactory.getNotSent();
            var cargas = CargaFactory.getNotSent();
            if(movimientos.length > 0 && cargas.length > 0){
                var stringEnvio = '';
                var counterProcesoCarga = 0;
                for(var j = 0; j < cargas.length; j++){
                    var carga = cargas[j];
                    if(carga.TipoProceso == TipoMovimiento.Recarga_carga && carga.Enviado == '0'){
                        var formatoCarga = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|0U|";
                        stringEnvio += String.format(formatoCarga,
                                carga.TipoProceso,
                                carga.CodigoPlanta,
                                carga.Fecha,
                                carga.Hora,
                                carga.NumeroDocumento,
                                carga.Densidad,
                                carga.KgAbastecidos,
                                carga.Kilometraje,
                                carga.PesoInicial,
                                carga.Latitud,
                                carga.Longitud);

                        counterProcesoCarga++;
                    }

                    for (var i = 0; i < movimientos.length; i++) {
                        var movimiento = movimientos[i];
                        if (movimiento.TipoProceso == TipoMovimiento.Recarga_movimiento && movimiento.Enviado == '0') {
                            var formato = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|{11}|0U|";
                            if (i == (movimientos.length - 1) && j == (cargas.length -1)) {//Si es el último
                                formato = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|{11}|0U";
                            }

                            stringEnvio += String.format(formato,
                                movimiento.TipoProceso,
                                movimiento.CodigoPlanta,
                                movimiento.Fecha,
                                movimiento.Hora,
                                movimiento.NumeroDocumento,
                                movimiento.DiferenciaVenta,
                                movimiento.Arrastre,
                                movimiento.Retorno,
                                movimiento.Ajuste,
                                movimiento.Latitud,
                                movimiento.Longitud,
                                '');

                            counterProcesoCarga++;
                        }
                    }                    
                }

                $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.Services + '.aspx?';
                $queryString = 'tr=abast' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&cp=' + counterProcesoCarga + '&ntr=' + ntr + '&dat=' + stringEnvio;
                $temp = $url + $queryString;
                $.ajax({
                    type: "GET",
                    url: $url + $queryString,
                    success: function (respuesta) {
                        if (respuesta === 'OK¡') {
                            //Update a Movimientos.
                            for (var i = 0; i < movimientos.length; i++) {
                                var movimiento = movimientos[i];
                                if (movimiento.TipoProceso == TipoMovimiento.Recarga_movimiento) {
                                    movimiento.rhoItem.updateAttributes({
                                        Enviado: 1,
                                        Estado: '1'
                                    });
                                }
                            }

                            //Update a Cargas.
                            for(var j = 0; j < cargas.length; j++){
                                var carga = cargas[j];
                                if(carga.TipoProceso == TipoMovimiento.Recarga_carga){
                                    carga.rhoItem.updateAttributes({
                                        Enviado: 1,
                                        Estado: '1'
                                    });
                                }
                            }

                            //TODO: Verificacion Pendientes de Envío.
                            //TODO: Comprobacion Items.

                            successCallback("done");
                        }
                    },
                    error: function (e) {
                        console.log(e.message);
                        console.log(e);
                    }
                });
            }else{
                successCallback("nada que enviar");
            }
        },

        sendMovimientoCierre: function (successCallback) {
            var movimientos = MovimientoFactory.getNotSent();

            if (movimientos.length > 0) {

                var stringEnvio = "";
                var counterProcesoCarga = 0;
                for (var i = 0; i < movimientos.length; i++) {
                    var movimiento = movimientos[i];
                    if (movimiento.TipoProceso == TipoMovimiento.Cierre && movimiento.Enviado == '0') {
                        var formato = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|{11}|0U|";
                        if (i == (movimientos.length - 1)) {//Si es el último
                            formato = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|{11}|0U";
                        }

                        stringEnvio += String.format(formato,
                            movimiento.TipoProceso,
                            movimiento.CodigoPlanta,
                            movimiento.Fecha,
                            movimiento.Hora,
                            '',
                            movimiento.DiferenciaVenta,
                            movimiento.Arrastre,
                            movimiento.Retorno,
                            movimiento.Ajuste,
                            movimiento.Latitud,
                            movimiento.Longitud,
                            movimiento.Km);

                        counterProcesoCarga++;
                    }
                }

                //TODO: Verificacion de pendientes de envío en caso de que haya envios pendientes de algún tipo..

                $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.Services + '.aspx?';
                $queryString = 'tr=abast' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&cp=' + counterProcesoCarga + '&ntr=' + ntr + '&dat=' + stringEnvio;
                $.ajax({
                    type: "GET",
                    url: $url + $queryString,
                    success: function (respuesta) {
                        if (respuesta === 'OK¡') {
                            for (var i = 0; i < movimientos.length; i++) {
                                var movimiento = movimientos[i];
                                if (movimiento.TipoProceso == TipoMovimiento.Cierre) {
                                    movimiento.rhoItem.updateAttributes({
                                        Enviado: 1
                                    });
                                }
                            }
                            successCallback("done");
                            cerrar_pda();
                        }
                    },
                    error: function (e) {
                        console.log(e.message);
                        console.log(e);
                    }
                });
            }else{
                successCallback("Nada que enviar");
            }
        },

        sendPagosPendientes: function (successCallback) {
            //TODO Rever la forma de controlar que toda esta función fue ejecutada
            $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.Services + '.aspx?';
            var totalRegistros = 0;
            var stringEnvio = "";

            var pagos = PagoFactory.getCobranzas();

            if(pagos.length > 0){
                totalRegistros += pagos.length;

                for (var j = 0; j < pagos.length; j++) {
                    var pago = pagos[j];
                    if(pago.enviado === "0") {
                        var formatoPago = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|{11}|{12}|{13}|{14}|{15}|{16}|0U|";

                        stringEnvio += String.format(formatoPago,
                            pago.transaccion,
                            pago.numeroPedido,
                            pago.codigoCliente,
                            pago.fecha,
                            pago.hora,
                            pago.centroAbastecedor,
                            pago.medioPago,
                            pago.monto,
                            pago.numeroIdentificador,
                            pago.tipo,
                            pago.banco,
                            pago.fechaVencimiento,
                            pago.codigoAutorizacion,
                            pago.cuotas,
                            pago.cupon,
                            pago.latitud,
                            pago.longitud
                        );
                    }
                }

                stringEnvio = stringEnvio.substr(0, stringEnvio.length - 1);

                $queryString = 'tr=cierre' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&cp=' + totalRegistros + '&ntr=' + ntr + '&dat=' + stringEnvio;

                $.ajax({
                    async: true,
                    type: "GET",
                    url: $url + $queryString,
                    success: function (respuesta) {
                        if (respuesta === 'OK¡') {
                            for (var j = 0; j < pagos.length; j++) {
                                var pago = pagos[j];
                                if(pago.enviado === '0') {

                                    pago.rhoItem.updateAttributes({
                                        Enviado: 1
                                    });
                                }
                            }
                        }else{
                            showAlert("Error","Se produjo un error en un envío de pago pendiente");
                        }
                    },
                    error: function (e) {
                        showAlert("Error","Se produjo un error de comunicación al enviar un pago pendiente");
                        console.log(e.message);
                        console.log(e);
                    }
                });
            }
            successCallback("done");
        },

        sendCierresPendientes: function (successCallback) {
            //TODO Rever la forma de controlar que toda esta función fue ejecutada
            $url = 'http://' + configs['ipServidor'] + configs['direccionServicios'] + '/' + TipoServicioMCL.Services + '.aspx?';

            var entregas = EntregaFactory.getNotSent();

            console.log(entregas);

            if (entregas.length > 0) {

                for (var i = 0; i < entregas.length; i++) {
                    var entrega = entregas[i];

                    var totalRegistros = 1;

                    if (entrega.TipoVenta == 1) {//Entrega Venta
                        var stringEnvio = "";

                        var formatoPedido = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|{11}|{12}|{13}|{14}|{15}|{16}|{17}|{18}|{19}|{20}|{21}|0U|";
                        //if (i == (entregas.length - 1)) {//Si es el último
                        //    formatoPedido = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|{11}|{12}|{13}|{14}|{15}|{16}|{17}|";
                        //}

                        stringEnvio += String.format(formatoPedido,
                            entrega.TipoVenta,
                            entrega.NumeroPedido,
                            entrega.CodigoCliente,
                            entrega.FechaEntrega,
                            entrega.FechaEnv,
                            entrega.CodigoProducto,
                            entrega.CantidadVendida.replace('.',','),
                            entrega.PrecioUnitario.replace('.',','),
                            entrega.IVA.replace('.',','),
                            entrega.IIBB.replace('.',','),
                            entrega.PI.replace('.',','),
                            entrega.PrecioTotal.replace('.',','),
                            entrega.NumeroDocumento,
                            entrega.TipoDocumento,
                            entrega.Latitud,
                            entrega.Longitud,
                            entrega.Precinto,
                            entrega.ControlCarga,
                            entrega.SIT,
                            entrega.PorcentajeInicial,
                            entrega.PorcentajeFinal,
                            entrega.Observaciones
                        );

                        var pagos = PagoFactory.getByNumeroPedido(entrega.NumeroPedido);
                        entrega.pagos = pagos;

                        totalRegistros += pagos.length;

                        for (var j = 0; j < pagos.length; j++) {
                            var pago = pagos[j];
                            if(pago.enviado === "0") {
                                var formatoPago = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10}|{11}|{12}|0U|";

                                stringEnvio += String.format(formatoPago,
                                    pago.transaccion,
                                    pago.numeroPedido,
                                    pago.codigoCliente,
                                    pago.centroAbastecedor,
                                    pago.medioPago,
                                    pago.monto,
                                    pago.numeroIdentificador,
                                    pago.tipo,
                                    pago.banco,
                                    pago.fechaVencimiento,
                                    pago.codigoAutorizacion,
                                    pago.cuotas,
                                    pago.cupon
                                );
                            }
                        }

                        stringEnvio = stringEnvio.substr(0, stringEnvio.length - 1);

                        $queryString = 'tr=cierre' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&cp=' + totalRegistros + '&ntr=' + ntr + '&dat=' + stringEnvio;

                        $.ajax({
                            async: true,
                            type: "GET",
                            url: $url + $queryString,
                            success: function (respuesta) {
                                if (respuesta === 'OK¡') {
                                    entrega.rhoItem.updateAttributes({
                                        Enviado: 1
                                    });
                                    for (var j = 0; j < entrega.pagos.length; j++) {
                                        var pago = entrega.pagos[j];
                                        if(pago.enviado === '0') {

                                            pago.rhoItem.updateAttributes({
                                                Enviado: 1
                                            });
                                        }
                                    }
                                }
                            },
                            error: function (e) {
                                console.log(e.message);
                                console.log(e);
                            }
                        });
                    } else if (entrega.TipoVenta == 2) {//No Entrega (Cancela pedido)

                        var formatoPedido = "{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|0U";

                        var totalRegistros = 1;

                        var stringEnvio = "";

                        stringEnvio += String.format(formatoPedido,
                            entrega.TipoVenta,
                            entrega.NumeroPedido,
                            entrega.CodigoCliente,
                            entrega.Fecha,
                            entrega.FechaEnv,
                            entrega.CodigoMotivo,
                            entrega.Latitud,
                            entrega.Longitud,
                            entrega.SIT
                        );

                        $queryString = 'tr=cierre' + '&user=' + userName + '&pass=' + password + '&idpda=' + idpda + '&cp=' + totalRegistros + '&ntr=' + ntr + '&dat=' + stringEnvio;

                        $.ajax({
                            type: "GET",
                            url: $url + $queryString,
                            success: function (respuesta) {
                                if (respuesta === 'OK¡') {
                                    entrega.rhoItem.updateAttributes({
                                        Enviado: 1
                                    });
                                }
                            },
                            error: function (e) {
                                console.log(e.message);
                                console.log(e);
                            }
                        });
                    }
                }
            }
            successCallback("done");
        }
    };

    manager.sendPendientes= function(successCallback){
        var taskQueue = [];

        //TODO REVISAR ESTO. Probar. Añadir manejo de flujo de errores

        //Movimiento de apertura pendiente?
        taskQueue.push(manager.sendMovimientoCarga);
        //Enviar cierres de pedidos?
        taskQueue.push(manager.sendCierresPendientes);
        //Enviar pagos pendientes?
        taskQueue.push(manager.sendPagosPendientes);
        //Movimientos de recarga pendientes?
        taskQueue.push(manager.sendMovimientoRecarga);
        //Movimientos de cierre pendientes?
        taskQueue.push(manager.sendMovimientoCierre);

        procesarSiguiente();

        function procesarSiguiente(){
            if(taskQueue.length>0) {
                var fn = taskQueue.shift();
                fn(taskDone);
            }else{
                successCallback("Todo procesado");
            }
        }

        function taskDone(msg){
            console.log(msg);
            procesarSiguiente();
        }
    };

    return manager;
})();