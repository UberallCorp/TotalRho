if (!Rho.ORM.getModel('Cliente_PDA')) {
    Rho.ORM.addModel(function (model) {
        model.modelName("Cliente_PDA");
        // Uncomment for RhoConnect integration
        // model.enable("sync");
        model.property("Autorizacion", "string");
        model.property("Calle", "string");
        model.property("Condicion_Pago", "string");
        model.property("Codigo_Destinatario", "string");
        model.property("Codigo_EstadoSAP", "int");
        model.property("Codigo_Planta", "string");
        model.property("Codigo_Postal", "string");
        model.property("Codigo_TipoCliente", "string");
        model.property("CodigoCliente", "int");
        model.property("Cuit", "string");
        model.property("Estado_Cliente", "int");
        model.property("Estado_SAP", "int");
        model.property("Material", "date");
        model.property("NIF", "string");
        model.property("NombreCliente", "string");
        model.property("Pais", "int");
        model.property("IVA", "string");
        model.property("Localidad", "string");
        model.property("PI", "string");
        model.property("PIB", "string");
        model.property("Poblacion", "string");
        model.property("Telefono", "string");
        model.property("Tipo_cliente", "string");
        model.property("Transporte", "string");
        model.property("Precio", "string");
        model.property("Region", "string");
        model.property("Sector", "string");
        model.property("Zona", "string");
        model.property("Latitud", "string");
        model.property("Longitud", "string");
        model.property('ACK', 'bool');
        model.property('DireccionEntrega', 'string');
        model.set("partition", "local");
    });
}

if(!Rho.ORM.getModel('ConfigPantalla')){
    Rho.ORM.addModel(function (model){
        model.modelName("ConfigPantalla");
        model.property("FontSize", "int");
        model.property("Contrast", "int");
        model.set("partition", "local");
    });
}

if (!Rho.ORM.getModel('Pedido')) {
    Rho.ORM.addModel(function (model) {
        model.modelName("Pedido");
        // Uncomment for RhoConnect integration
        // model.enable("sync");
        model.property("Autorizacion", "string");
        model.property("Bloqueado", "string");
        model.property("Cantidad_Pedida", "string");
        model.property("Codigo_Camion", "string");
        model.property("Codigo_Chofer", "string");
        model.property("Codigo_Cliente", "string");
        model.property("Codigo_Sector", "string");
        model.property("Codigo_Transporte", "int");
        model.property("CodigoStatusPedido", "int");
        model.property("CodigoTipoCliente", "string");
        model.property("Cond_Pago", "string");
        model.property("Cuit", "string");
        model.property("Direccion_Destinatario", "string");
        model.property("Estado_Pedido", "int");
        model.property("Fecha", "date");
        model.property("Fecha_Entrega", "string");
        model.property("IIBB", "string");
        model.property("Ind_Pedidos", "int");
        model.property("IVA", "string");
        model.property("Localidad", "string");
        model.property("Nombre_Cliente", "string");
        model.property("Nombre_Destinatario", "string");
        model.property("NumeroPedido", "string");
        model.property("NumeroPedidoCRM", "string");
        model.property("Observacion", "string");
        model.property("Percep_IVA", "string");
        model.property("Precio", "string");
        model.property("Prioridad", "integer");
        model.property("Reclamo", "string");
        model.property("Region", "string");
        model.property("Ruta", "string");
        model.property("SIT", "int");
        model.property("Zona", "string");
        model.property("Latitud", "string");
        model.property("Longitud", "string");
        model.property('ACK', 'bool');
        model.property('Revision','string');

        model.set("partition", "local");

    });
}

// TIAPDA
if (!Rho.ORM.getModel('TIAPDA')) {
    Rho.ORM.addModel(function (model) {
        model.modelName('TIAPDA');
        model.property('ID', 'integer');
        model.property('Arrastre', 'string');
        model.property('Estado', 'string');
        model.property('Fecha', 'date');
        model.property('Hora', 'time');
        //TODO: Revisar cuales de estos van y ver si se pueden poner nombres mas declarativos
        model.property('DP', 'string');
        model.property('KG', 'string');
        model.property('KC', 'string');
        model.property('KM', 'string');
        model.property('NT', 'string');
        model.property('PC', 'string');

        model.set("partition", "local");
    });
}

//UsuarioDatos
if(!Rho.ORM.getModel('UsuarioDatos')){
    Rho.ORM.addModel(function(model) {
        model.modelName("UsuarioDatos");
        model.property('ID', 'int');
        model.property('IDPDA', 'string');
        model.property('Version', 'int');
        model.property('Usuario', 'string');
        model.property('Password', 'string');
        model.property('Nombre', 'string');
        model.property('Fecha', 'date');
        model.property('Hora', 'time');
        model.property('GPS', 'int');
        model.property('HR', 'string');
        model.property('UsuarioFTP', 'string');
        model.property('PassFTP', 'string');
        model.property('IpFTP', 'string');
        model.property('DirFTP', 'string');
    });
}

//GPS
if(!Rho.ORM.getModel('GPS')){
    Rho.ORM.addModel(function(model) {
        model.modelName("GPS");
        model.property('Id', 'int');
        model.property('Cliente', 'string');
        model.property('Enviado', 'string');
        model.property('Fecha', 'string');//Usar este formato: dd/MM/yyyy HH:mm:ss
        model.property('HR', 'string');
        model.property('Latitud', 'string');
        model.property('Longitud', 'string');
        //model.property('StringGPS', 'string');
        model.property('UUID', 'string');
    });
}

//Carga (ex EnvioCarga)
if(!Rho.ORM.getModel('Carga')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Carga");
        model.property('Id', 'int');
        model.property('CodigoPlanta', 'string');
        model.property('Densidad', 'string');
        model.property('Estado', 'string');
        model.property('Enviado', 'bool');
        model.property('Fecha', 'string');
        model.property('Hora', 'string');
        model.property('KgAbastecidos', 'string');
        model.property('Kilometraje', 'string');
        model.property('Latitud', 'string');
        model.property('Longitud', 'string');
        model.property('NotaTraslado', 'string');
        model.property('NumeroDocumento', 'string');
        model.property('PesoInicial', 'string');
        model.property('TipoProceso', 'string');
    });
}

//Movimiento (ex EnvioMovimiento)
if(!Rho.ORM.getModel('Movimiento')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Movimiento");
        model.property('Id', 'int');
        model.property('Ajuste', 'string');
        model.property('Arrastre', 'string');
        model.property('CodigoPlanta', 'string');
        model.property('DiferenciaVenta', 'string');
        model.property('Estado', 'string');
        model.property('Enviado', 'bool');
        model.property('Fecha', 'string');
        model.property('Hora', 'string');
        model.property('Km', 'string');
        model.property('Latitud', 'string');
        model.property('Longitud', 'string');
        model.property('NotaTranslado', 'string');
        model.property('NumeroDocumento', 'string');
        model.property('Retorno', 'string');
        model.property('TipoProceso', 'string');
    });
}

//Medio_Pago
if(!Rho.ORM.getModel('MedioPago')){
    Rho.ORM.addModel(function(model) {
        model.modelName("MedioPago");
        model.property('CodigoMedioPago', 'string');
        model.property('Descripcion', 'string');
        model.property('Estado', 'int');
    });
}

//EnvioDatos = Entrega
if(!Rho.ORM.getModel('Entrega')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Entrega"),
        model.property('CantidadVendida', 'string'),
        model.property('CodigoCliente', 'string'),
        model.property('CodigoMotivo', 'string'),
        model.property('CodigoProducto', 'string'),
        model.property('ControlCarga', 'string'),
        model.property('Estado', 'int'),
        model.property('FechaEnv', 'string'),
        model.property('IIBB', 'string'),
        model.property('IVA', 'string'),
        model.property('PercepcionIVA', 'string'),
        model.property('Latitud', 'string'),
        model.property('Longitud', 'string'),
        model.property('NumeroDocumento', 'string'),
        model.property('NumeroPedido', 'string'),
        model.property('NumeroPedidoCRM', 'string'),
        model.property('PI', 'string'),
        model.property('Precio', 'string'),
        model.property('Precinto', 'string'),
        model.property('PrecioTotal', 'string'),
        model.property('PrecioUnitario', 'string'),
        model.property('SIT', 'int'),
        model.property('TipoDocumento', 'string'),
        model.property('TipoVenta', 'string'),
        model.property('Enviado', 'string'),
        model.property('Espontaneo', 'bool'),
        model.property('Bloqueado', 'bool'),
        model.property('CantidadPedida', 'string'),
        model.property('CodigoCamion', 'string'),
        model.property('CodigoChofer', 'string'),
        model.property('CodigoSector', 'string'),
        model.property('CodigoTransporte', 'int'),
        model.property('CodigoStatusPedido', 'int'),
        model.property('CondicionPago', 'string'),
        model.property('IndPedidos', 'int'),
        model.property('Observacion', 'string'),
        model.property('Region', 'string'),
        model.property('Ruta', 'string'),
        model.property('Zona', 'string'),
        model.property('DireccionDestinatario', 'string'),
        model.property('FechaEntrega', 'Date'),
        model.property('NombreDestinatario', 'string'),
        model.property('NombreCliente', 'string'),
        model.property('Localidad', 'string'),
        model.property('CodigoTipoCliente', 'string')
        model.property('PorcentajeInicial', 'int');
        model.property('PorcentajeFinal', 'int');
        model.property('Observaciones', 'string');
    });
}

if(!Rho.ORM.getModel('CondicionPago')){
    Rho.ORM.addModel(function(model){
        model.modelName('CondicionPago');
        model.property('Codigo', 'string');
        model.property('Descripcion', 'string');
        model.property('Estado', 'string');
        model.property('Fecha', 'string');
        model.property('Indice', 'string');
    });
}




//StringEnvios
//if(!Rho.ORM.getModel('StringEnvios')){
//    Rho.ORM.addModel(function(model){
//        model.modelName('StringEnvios');
//        model.property('ID', 'int');
//        model.property('Estado', 'int');
//        model.property('StringEnvio', 'string');
//        model.property('TipoEnvio', 'int');
//    });
//};


//Algunas tablas param�tricas (con datos precargados o sincronizables)

//Producto
if(!Rho.ORM.getModel('Producto')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Producto");
        model.property('Codigo', 'string');
        model.property('Descripcion', 'string');
        model.property('Estado', 'int');
        model.property('Ind_Producto', 'string');
    });
}

//Planta
if(!Rho.ORM.getModel('Planta')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Planta");
        model.property('Codigo', 'string');
        model.property('Descripcion', 'string');
        model.property('Tipo', 'string');
        model.property('Estado', 'int');
        model.property('Ind_Planta', 'string');
    });
}

//Pago
if(!Rho.ORM.getModel('Pago')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Pago");
        model.property('Banco', 'string');
        model.property('CentroAbastecedor', 'string');
        model.property('CodigoAutorizacion', 'string');
        model.property('CodigoCliente', 'int');
        model.property('Cuotas', 'string');
        model.property('Cupon', 'string');
        model.property('Estado', 'int');
        model.property('Fecha', 'string');
        model.property('FechaVencimiento', 'string');
        model.property('Hora', 'string');
        model.property('ID', 'int');
        model.property('Latitud', 'string');
        model.property('Longitud', 'string');
        model.property('MedioPago', 'string');
        model.property('Monto', 'string');
        model.property('NumeroIdentificador', 'string');
        model.property('NumeroPedido', 'string');
        model.property('Tipo', 'string');
        model.property('Transaccion', 'string');
    });
}

if(!Rho.ORM.getModel('DatosServicios')){
    Rho.ORM.addModel(function(model) {
        model.modelName("DatosServicios");
        model.property('AdminAllow', 'string');
        model.property('Carpeta', 'string');
        model.property('ID', 'int');
        model.property('IpServer', 'string');
        model.property('Porcentaje', 'string');
    });
}

////Motivo
//if(!Rho.ORM.getModel('Planta')){
//    Rho.ORM.addModel(function(model) {
//        model.modelName("Planta");
//        model.property('IdMotivo', 'int');
//        model.property('Descripcion_Planta', 'string');
//        model.property('Tipo', 'string');
//        model.property('Estado', 'int');
//        model.property('Ind_Planta', 'string');
//    });
//};
//
////Marca
//if(!Rho.ORM.getModel('Planta')){
//    Rho.ORM.addModel(function(model) {
//        model.modelName("Planta");
//        model.property('Codigo', 'string');
//        model.property('Descripcion', 'string');
//    });
//};

if(!Rho.ORM.getModel('Banco')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Banco");
        model.property('Codigo', 'string');
        model.property('Descripcion', 'string');
        model.property('Estado', 'int');
        model.property('FechaCreacion', 'string');
        model.property('Id', 'string');//IND_BANCO
    });
}

if(!Rho.ORM.getModel('Motivo')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Motivo");
        model.property('Id', 'string');
        model.property('Descripcion', 'string');
    });
}

if(!Rho.ORM.getModel('Region')){
    Rho.ORM.addModel(function(model) {
        model.modelName("Region");
        model.property('Codigo', 'string');
        model.property('Id', 'string');//IND_Region
        model.property('Descripcion', 'string');
        model.property('Estado', 'string');
        model.property('FechaCreacion', 'string');
        model.property('CodigoPais', 'string');
    });
}

if(!Rho.ORM.getModel('TipoMedioPago')){
    Rho.ORM.addModel(function(model) {
        model.modelName("TipoMedioPago");
        model.property('Codigo', 'string');
        model.property('CodigoMedioPago', 'string');//IND_Region
        model.property('Descripcion', 'string');
        model.property('Estado', 'string');
    });
}