var colors = require('colors');
var util = require('util');
var serverProxy = require('./serverProxy');

process.stdin.resume();
process.stdin.setEncoding('utf8');

var LISTEN_PORT = 8000;
var ENDPOINT = process.env.SERVERMONKEY_HOST;

if (!process.env.SERVERMONKEY_HOST) {
    console.log('There must be a SERVERMONKEY_HOST environment variable defined'.red);
    process.exit();
}

var masterbrand = 'BBC';

var proxy = serverProxy.createServer({
    endpoint: ENDPOINT,
    listen_port: LISTEN_PORT
});

proxy.addBodyFilter(function (body, callback) {
    var str = body.toString();
    str = str.replace(/BBC/g, masterbrand);
    return new Buffer(str);
});

proxy.addHeaderFilter(function (key, value) {
/*
    if (key === 'x-powered-by') {
        return false;
    }
    if (key === 'cache-control' && value.indexOf('must-revalidate') === -1) {
        //return value + ", must-revalidate";
    }
    if (key === 'cache-control' && value.indexOf('stale-if-error') === -1) {
        return value + ", stale-if-error=21600";
    }
*/
    return value;
});




function showPrompt() {
    console.log('Enter command (or help):');
}

process.stdin.on('data', function (text) {
    text = text.trim();
    if (text === 'quit') {
        done();
    } else if (text === 'help') {
        console.log([
            'Available commands:'.green,
            'mb [masterbrand]'.white + ' Changes the masterbrand'.gray,
            'help'.white + ' Shows this message'.gray,
            'quit'.white + ' Exits'.gray
        ].join('\n'));
    } else if (text.substring(0,3) === 'mb ') {
        masterbrand = text.substring(3);
        console.log('Mastebrand set to ' + masterbrand);
    }
    showPrompt();
});
showPrompt();

function done() {
    console.log('Now that process.stdin is paused, there is nothing more to do.');
    process.exit();
}

//proxy.setDelay(10);


