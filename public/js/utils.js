function showAlert (titleParam, messageParam) {
    Rho.Notification.showPopup({
        title: titleParam,
        message: messageParam,
        buttons: [{id:'ok', title:'Ok'}],
        types: [Rho.Notification.TYPE_DIALOG]
    }, function(e){
        if(e.button_id == "ok"){
            Rho.Notification.hidePopup();
        }
    });
}

function showConfirm (titleParam, messageParam, negativeButtonText, positiveButtonText , positiveCallback) {

    if (typeof negativeButtonText === 'undefined') { negativeButtonText = 'Cancelar'; }
    if (typeof positiveButtonText === 'undefined') { positiveButtonText = 'Ok'; }

    Rho.Notification.showPopup({
        title: titleParam,
        message: messageParam,
        buttons: [{id:'cancel', title:negativeButtonText},{id:'ok', title:positiveButtonText}]
    }, function(e){
        if(e.button_id == "ok"){
            if (positiveCallback && typeof(positiveCallback) === "function") {
                positiveCallback();
            }else{
                console.log("Invalid callback function");
            }
        }
        Rho.Notification.hidePopup();
    });
}

//function Geolocalizar (q) {
//
//    var deferred = q.defer();
//
//    try{
//
//        Rho.GeoLocation.set_notification(obtenerDatosGPS,"",0);
//    }catch(e){
//        showAlert('Total Argentina', 'Error inesperado en la geolocalizacion.');
//    }
//
//    function obtenerDatosGPS (params){
//        var gpsAvailable = params.known_position;
//        if(gpsAvailable !== 'undefined'){
//            if(gpsAvailable == 1){
//                var latitude = params.latitude;
//                var longitude = params.longitude;
//                deferred.resolve({latitude:latitude, longitude:longitude});
//                return deferred.promise;
//            }else{
//                showAlert('Total Argentina', 'No se pudo geolocalizar. Encender el GPS, dirigirse a un lugar abierto e intentar nuevamente.');
//            }
//        }else{
//            showAlert('Total Argentina', 'No se pudo geolocalizar. Encender el GPS, dirigirse a un lugar abierto e intentar nuevamente.');
//        }
//    }
//
//}
