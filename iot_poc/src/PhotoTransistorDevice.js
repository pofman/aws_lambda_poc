'use strict';

let five = require('johnny-five');
let ShadowDevice = require('./ShadowDevice');

module.exports = class PhotoTransistorDevice extends ShadowDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host, initialState) {
        super(deviceName, topics, keyPath, certPath, caPath, clientId, host, initialState);
    }

    get options() { return this._options; }
    set options(options) { this._options = options; }
    get sensor() { return this._sensor; }
    set sensor(sensor) { this._sensor = sensor; }

    initializePhysicalSensor(options) {
        this.options = options;
        this.sensor = new five.Light({
            pin: this.options.pin,
            freq: this.options.freq
        });

        this.onChange((data) => {
            this.update(true, {
                sensor: this.deviceName,
                date: Date.now(),
                level: data.level
            });
        });
    }

    within(range, callback) {
        this.sensor.within(range, callback);
    }

    onData(callback) {
        this.sensor.on('data', callback);
    }

    onChange(callback) {
        this.sensor.on('change', callback);
    }
}
