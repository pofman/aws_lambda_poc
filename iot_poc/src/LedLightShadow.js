'use strict';

let ShadowDevice = require('./ShadowDevice');

module.exports = class LedLightShadow extends ShadowDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host, initialState) {
        super(deviceName, topics, keyPath, certPath, caPath, clientId, host, initialState);
    }

    turnLedOn () {
        this.update(false, {
            light: this.deviceName,
            status: '1'
        });
    }

    turnLedOff () {
        this.update(false, {
            light: this.deviceName,
            status: '0'
        });
    }

    reportLedOn () {
        this.update(true, {
            light: this.deviceName,
            status: '1'
        });
    }

    reportLedOff () {
        this.update(true, {
            light: this.deviceName,
            status: '0'
        });
    }
}