var colors = require('colors');
var util = require('util');
var serverProxy = require('./serverProxy');
var menu = require('./menu/simpleMenu').createMenu('ServerMonkey');

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


function showBlacklist() {
    var bl = proxy.getBlacklist();
    if (bl.length === 0) {
        console.log('Blacklist list is empty');
    } else {
        console.log('Current blacklisted feeds are: ');
        console.log(bl.join('\n').green);
    }
}

menu.addOption('mb', 'masterbrand', 'Changes the masterbrand', function (newMasterbrand) {
    masterbrand = newMasterbrand;
    console.log('Mastebrand set to ' + masterbrand);
});

menu.addOption('bladd', 'feed', 'Adds a new feed to the blacklisted list', function (feed) {
    var bl = proxy.getBlacklist();
    console.log("Adding ", feed);
    bl.push(feed);
    showBlacklist();
});

menu.addOption('blclear', null, 'Clear the blacklisted feeds', function () {
    proxy.setBlacklist([]);
    showBlacklist();
});

menu.addOption('blshow', null, 'List which feeds are blacklisted', function () {
    showBlacklist();
});

menu.addOption('delay', 'seconds', 'Adds some delay to the response', function (delay) {
    proxy.setDelay(delay);
    console.log('Delay set to ' + delay + "s");
});

menu.addOption('help', null, 'Show list of commands', function () {
    menu.showOptions();
});

menu.addOption('quit', null, 'Exit servermonkey', function () {
    process.exit();
});

process.stdin.on('data', function (text) {
    text = text.trim();
    menu.parseInput(text);
    menu.showPrompt();
});
menu.showOptions();
menu.showPrompt();



