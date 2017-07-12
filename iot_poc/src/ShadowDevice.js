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

        this.device.on('connect', function() {
            console.log('connect ' + this.deviceName);
            this.device.register(this.deviceName, {},
                function(err, failedTopics) {
                    if (err || failedTopics) {
                        console.log('shadow register failure', err, failedTopics);
                        return;
                    }

                    let ledState = { 'state': { 'reported': this.initialState } };
                    this.clientToken = this.device.update(this.deviceName, ledState);

                    if (this.clientToken === null) {
                        console.log('update shadow failed, operation still in progress');
                    }

                    console.log('Device thing registered.');
                }.bind(this));
        }.bind(this));

        this.device.on('status', function(thingName, stat, clientToken, stateObject) {
            console.log('received ' + stat + ' on ' + thingName + ': ' + JSON.stringify(stateObject));
        }.bind(this));

        this.device.on('delta', function(thingName, stateObject) {
            console.log('received delta on ' + thingName + ': ' + JSON.stringify(stateObject));
        }.bind(this));

        this.device.on('timeout', function(thingName, clientToken) {
            console.log('received timeout on ' + thingName + ' with token: ' + clientToken);
        }.bind(this));

        this.device.on('close', function() {
            console.log('close ' + this.deviceName);
        }.bind(this));

        this.device.on('reconnect', function() {
            console.log('reconnect ' + this.deviceName);
        }.bind(this));

        this.device.on('offline', function() {
            console.log('offline ' + this.deviceName);
        }.bind(this));

        this.device.on('error', function(error) {
            console.log('error ' + this.deviceName + ': ', error);
        }.bind(this));

        this.device.on('message', function(topic, payload) {
            console.log('message ' + this.deviceName + ': ', topic, payload.toString());
        }.bind(this));
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
    }
}