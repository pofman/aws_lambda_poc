'use strict'

let awsIot = require('aws-iot-device-sdk');
let CustomDevice = require('./CustomDevice');

module.exports = class ShadowDevice extends CustomDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host, initialState) {
        super(deviceName, topics, keyPath, certPath, caPath, clientId, host);

        this._initialState = initialState;
    }

    set initialState (initialState) { this._initialState = initialState; }
    get initialState () { return this._initialState; }
    set clientToken (clientToken) { this._clientToken = clientToken; }
    get clientToken () { return this._clientToken; }

    initialize() {
        this.device = awsIot.thingShadow({
            keyPath: this.keyPath,
            certPath: this.certPath,
            caPath: this.caPath,
            clientId: this.clientId,
            host: this.host,
            region: 'us-east-2',
            baseReconnectTimeMs: 1000,
            debug: true
        });

        this.device.on('connect', () => {
            console.log('connect ' + this.deviceName);
            this.registerShadowDevice(this.deviceName, (err, failedTopics) => {
                let ledState = { 'state': { 'reported': this.initialState } };
                this.clientToken = this.device.update(this.deviceName, ledState);

                if (this.clientToken === null) {
                    console.log('update shadow failed, operation still in progress');
                }
            });
        });

        this.device.on('status', (thingName, stat, clientToken, stateObject) => {
            console.log('received ' + stat + ' on ' + thingName + ': ' + JSON.stringify(stateObject));
        });

        this.device.on('delta', (thingName, stateObject) => {
            console.log('received delta on ' + thingName + ': ' + JSON.stringify(stateObject));
        });

        this.device.on('timeout', (thingName, clientToken) => {
            console.log('received timeout on ' + thingName + ' with token: ' + clientToken);
        });

        this.bindCommonEvents();
    }

    registerShadowDevice(thingName, callback) {
        this.device.register(thingName, {},
            (err, failedTopics) => {
                if (err || failedTopics) {
                    console.log('shadow register failure', err, failedTopics);
                    return;
                }

                if (callback) {
                    callback(err, failedTopics);
                }

                console.log('Device thing registered.');
            }
        );
    }

    update(data) {
        let ledState = { 'state': { 'desired': data } };
        this.clientToken = this.device.update(this.deviceName, ledState);

        if (this.clientToken === null) {
            console.log('update shadow failed, operation still in progress');
        } else {
            this.publish(data);
        }
    }

    get(thingName) {
        let localThingToken = this.device.get(thingName);
        return localThingToken;
    }
}