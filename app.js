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
    function showBlacklist() {
        var bl = proxy.getBlacklist();
        if (bl.length === 0) {
            console.log('Blacklist list is empty');
        } else {
            console.log('Current blacklisted feeds are: ');
            console.log(bl.join('\n').green);
        }
    }

    text = text.trim();

    if (text === 'quit') {
        done();
    } else if (text === 'help') {
        console.log([
            'Available commands:'.green,
            'mb [masterbrand]' + '\t Changes the masterbrand'.gray,
            'delay [seconds]' + '\t\t Adds some delay to the response'.gray,
            'bladd [feed]' + '\t\t Add a feed to the blacklisted list'.gray,
            'blshow' + '\t\t\t List which feeds are blacklisted'.gray,
            'blclear' + '\t\t\t Clear the blacklisted feeds'.gray,
            'help' + '\t\t\t Shows this message'.gray,
            'quit' + '\t\t\t Exits'.gray
        ].join('\n'));

    } else if (text.indexOf('bladd ') === 0) {
        var newitem = text.substring(6);
        var bl = proxy.getBlacklist();
        console.log("Adding ", newitem);
        bl.push(newitem);
        showBlacklist();

    } else if (text.indexOf('blclear') === 0) {
        proxy.setBlacklist([]);
        showBlacklist();

    } else if (text.indexOf('blshow') === 0) {
        showBlacklist();

    } else if (text.indexOf('delay ') === 0) {
        var delay = parseInt(text.substring(6));
        proxy.setDelay(delay);
        console.log('Delay set to ' + delay);

    } else if (text.indexOf('mb ') === 0) {
        masterbrand = text.substring(3);
        console.log('Mastebrand set to ' + masterbrand);

    } else if (text !== "") {
        console.log((text + " is not a command").red);

    }
    showPrompt();
});
showPrompt();

function done() {
    process.exit();
}


