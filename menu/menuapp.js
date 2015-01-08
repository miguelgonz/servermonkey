var menu = require('./simpleMenu').createMenu('My menu example');

menu.addOption('add', 'item', 'Add an item', function (item) {
    console.log('Now we should add ', item);
});

menu.addOption('clear', null, 'Clear everything', function (item) {
    console.log('Clear it all!');
});

menu.showOptions();
menu.parseInput('clear');
menu.parseInput('add miguel');
