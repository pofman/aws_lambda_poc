'use strict';

let ShadowDevice = require('./ShadowDevice');

module.exports = class MonitorDevice extends ShadowDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host) {
        super(deviceName, topics, keyPath, certPath, caPath, clientId, host);
    }
}