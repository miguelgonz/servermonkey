var http = require('http');
var extend = require('util')._extend;
var EventEmitter = require('events').EventEmitter;

var defaults = {
    listen_port: 8000,
    endpoint: "ibl.cloud.bbc.co.uk"
};

exports.createServer = function (config) {
    if (typeof config === 'undefined') config = {};
    config = extend(defaults, config);
    console.log(config);

    var bodyFilters = [], headerFilters = [], delay = 0, server = {};

    server.addBodyFilter = function (cb) {
        bodyFilters.push(cb);
    };

    server.addHeaderFilter = function (cb) {
        headerFilters.push(cb);
    };

    server.setDelay = function (dasDelay) {
        delay = dasDelay;
    };

    http.createServer(function (client_req, client_res) {
        console.log('Request ' + new Date());
        var headers = extend({}, client_req.headers);
        headers.host = config.endpoint;
        headers['accept-encoding'] = 'deflate';
        var options = {
            hostname: config.endpoint,
            port: 80,
            path: client_req.url,
            method: client_req.method,
            headers: headers
        };

        var buffer = new Buffer(0);

        var proxy = http.request(options, function (res) {
            var value;
            res.on('data', function (chunk) {
                buffer = Buffer.concat([buffer, chunk]);
            });

            for(var header in res.headers) {
                value = res.headers[header];
                for (var filter in headerFilters) {
                    value = headerFilters[filter](header, value);
                }
                if (value) {
                    client_res.setHeader(header, value);
                }
            }

            res.on('end', function () {
                console.log("END");
                for (var filter in bodyFilters) {
                    buffer = bodyFilters[filter](buffer);
                }
                client_res.write(buffer);
                if (delay === 0) {
                    client_res.end();
                } else {
                    setTimeout(function () {
                        client_res.end();
                    }, delay);
                }
            });
        });

        client_req.pipe(proxy, {
            end: true
        });
    }).listen(config.listen_port);

    return server;
}

