var LISTEN_PORT = 8000;
var ENDPOINT = "api.flickr.com";

var serverProxy = require('./serverProxy');

var proxy = serverProxy.createServer({
    endpoint: ENDPOINT,
    listen_port: LISTEN_PORT
});

proxy.addBodyFilter(function (body, callback) {
    var str = body.toString();
    str = str.replace(/BBC/g, 'ITV');
    str = str.replace(/EastEnders/g, 'Coronation St');
    str = str.replace(/Stacey/g, 'Tina');
    str = str.replace(/ichef/g, 'masterchef');
    return new Buffer(str);
});

proxy.addHeaderFilter(function (key, value) {
    if (key === 'x-powered-by') {
        return false;
    }
    if (key === 'cache-control' && value.indexOf('stale-if-error') === -1) {
        return value + ", stale-if-error=21600";
    }
    return value;
});

//proxy.setDelay(10);


