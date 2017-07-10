'use strict';

let CustomDevice = require('./CustomDevice');

module.exports = class LedLight extends CustomDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host) {
        super(deviceName, topics, keyPath, certPath, caPath, clientId, host);
    }

    turnLedOn () {
        this.publish({
            name: this.deviceName,
            status: 1
        });
    }

    turnLedOff () {
        this.publish({
            name: this.deviceName,
            status: 0
        });
    }
}