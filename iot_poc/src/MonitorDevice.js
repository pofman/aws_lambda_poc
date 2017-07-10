'use strict';

let CustomDevice = require('./CustomDevice');

module.exports = class MonitorDevice extends CustomDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host) {
        super(deviceName, topics, keyPath, certPath, caPath, clientId, host);
    }
}