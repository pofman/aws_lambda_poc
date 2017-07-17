'use strict';

let five = require('johnny-five');

module.exports = class Button {
    constructor() {

    }

    get options() { return this._options; }
    set options(options) { this._options = options; }
    get instance() { return this._instance; }
    set instance(instance) { this._instance = instance; }

    initializePhysicalButton(options) {
        this.options = options;
        this.instance = new five.Button(this.options.pin);
    }

    // "hold" the button is pressed for specified time.
    //        defaults to 500ms (1/2 second)
    //        set
    onHold(callback) {
        this.instance.on('hold', callback);
    }

    onUp(callback) {
        this.instance.on('up', callback);
    }

    onDown(callback) {
        this.instance.on('down', callback);
    }
}