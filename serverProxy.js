var http = require('http'),
    colors = require('colors'),
    moment = require('moment'),
    extend = require('util')._extend,
    EventEmitter = require('events').EventEmitter,
    defaults = {
        listen_port: 8000,
        endpoint: "api.flickr.com"
    };

exports.createServer = function (config) {
    if (typeof config === 'undefined') config = {};
    config = extend(defaults, config);
    console.log(config);

    var bodyFilters = [], headerFilters = [], delay = 0, server = {}, blacklist = [];

    server.addBodyFilter = function (cb) {
        bodyFilters.push(cb);
    };

    server.addHeaderFilter = function (cb) {
        headerFilters.push(cb);
    };

    server.getBlacklist = function () {
        return blacklist;
    };

    server.setDelay = function (dasDelay) {
        delay = dasDelay;
    };

    http.createServer(function (client_req, client_res) {

        var url = client_req.url.split("?");

        console.log(moment().format("HH:mm:ss").gray + " " +
            client_req.method.green + " " +
            url[0] + "?".gray +  url[1].gray
        );

        for (var blacklist_item in blacklist) {
            if (client_req.url.indexOf(blacklist[blacklist_item]) !== -1) {
                console.log(("REQUEST BLOCKED, it matched \"" + blacklist[blacklist_item]).white.bgRed + "\"");
                client_res.writeHead(503, {});
                client_res.end();
                return;
            }
        }

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
                for (var filter in bodyFilters) {
                    buffer = bodyFilters[filter](buffer);
                }
                client_res.write(buffer);
                if (delay === 0) {
                    client_res.end();
                } else {
                    setTimeout(function () {
                        client_res.end();
                    }, delay * 1000);
                }
            });
        });

        client_req.pipe(proxy, {
            end: true
        });
    }).listen(config.listen_port);

    return server;
}

