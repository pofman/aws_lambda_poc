'use strict';

let ShadowDevice = require('./ShadowDevice');
let ThingAPI = require('./ThingAPI');

module.exports = class MonitorDevice extends ShadowDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host) {
        super(deviceName, topics, keyPath, certPath, caPath, clientId, host);

        this.devicesToMonitor = [];
    }

    get devicesToMonitor () { return this._devicesToMonitor; }
    set devicesToMonitor (devicesToMonitor) { this._devicesToMonitor = devicesToMonitor; }

    monitor(deviceName, callback) {
        this.registerShadowDevice(deviceName, (err, failedTopics) => {
            this.devicesToMonitor.push({ device: deviceName });

            this.device.on('status', (thingName, stat, clientToken, stateObject) => {
                let item = this.devicesToMonitor.find((element) => {
                    return element.device == thingName;
                });

                if (item) {
                    item.status = stateObject;
                    console.log('monitor getting shadow state: ', item);
                }
            });

            console.log('monitor registered: ', deviceName);
            this.get(deviceName);
        });
    }
}