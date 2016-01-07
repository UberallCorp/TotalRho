/**
 * Created by lbriglio on 03/07/2015.
 */

if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : ''
            ;
        });
    };
}

if (!String.toFixed) {
    String.toFixed = function(format,replaceValue,fixSize) {
        return format.replace("{0}",Number(replaceValue).toFixed(fixSize));
    };
}
