var colors = require('colors');
var util = require('util');

exports.createMenu = function (name) {

    var menu = {
        name: name,
        items: []
    };

    menu.addOption = function (command, paramName, description, callback) {
        this.items.push({
            command: command,
            paramName: paramName,
            description: description,
            callback: callback
        });
    };

    menu.showOptions = function () {
        console.log(this.name);
        console.log(Array(this.name.length + 1).join("="));
        console.log('\nAvailable commands:'.green);
        var longestCommand = 0, length, item, _item, spaces;
        for (_item in this.items) {
            item = this.items[_item];
            length = item.command.length;
            if (item.paramName) {
                length += item.paramName.length + 4;
            }
            if (longestCommand < length) {
                longestCommand = length;
            }
        }

        for (_item in this.items) {
            item = this.items[_item];
            if (item.paramName) {
                paramName = (" [" + item.paramName.underline + "] ");
                paramNameLength = item.paramName.length + 4;
            } else {
                paramName = '';
                paramNameLength = 0;
            }


            spaces = Array(longestCommand - item.command.length - paramNameLength + 4).join(" ");

            console.log(
                item.command + 
                paramName + 
                spaces + 
                item.description.gray
            );
        }
    };

    menu.parseInput = function (input) {
        if (input === '') {
            return;
        }
        for (var _item in this.items) {
            var item = this.items[_item];
            if (input.indexOf(item.command) === 0) {
                param = null;
                if (item.paramName) {
                    param = input.substring(item.command.length + 1);
                }
                item.callback(param);
                return;
            }
        }
        console.log(("\"" + input + "\" is not a command").red);
    };

    menu.showPrompt = function () {
        console.log('Enter command (or help):');
    };

    return menu;
};
