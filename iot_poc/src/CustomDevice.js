'use strict';

let awsIot = require('aws-iot-device-sdk');

module.exports = class CustomDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host){
        this._keyPath = keyPath;
        this._certPath = certPath;
        this._caPath = caPath;
        this._clientId = clientId;
        this._host = host;
        this._deviceName = deviceName;
        this._topics = topics;
    }

    set keyPath (keyPath) { this._keyPath = keyPath; }
    get keyPath () { return this._keyPath; }
    set certPath (certPath) { this._certPath = certPath; }
    get certPath () { return this._certPath; }
    set caPath (caPath) { this._caPath = caPath; }
    get caPath () { return this._caPath; }
    set clientId (clientId) { this._clientId = clientId; }
    get clientId () { return this._clientId; }
    set host (host) { this._host = host; }
    get host () { return this._host; }
    set topics (topics) { this._topics = topics; }
    get topics () { return this._topics; }
    set deviceName (deviceName) { this._deviceName = deviceName; }
    get deviceName () { return this._deviceName; }
    set device (device) { this._device = device; }
    get device () { return this._device; }

    initialize() {
        this.device = awsIot.device({
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
        });

        this.bindCommonEvents();
    }

    bindCommonEvents() {
        this.device.on('close', () => {
            console.log('close ' + this.deviceName);
        });

        this.device.on('reconnect', () => {
            console.log('reconnect ' + this.deviceName);
        });

        this.device.on('offline', () => {
            console.log('offline ' + this.deviceName);
        });

        this.device.on('error', (error) => {
            console.log('error ' + this.deviceName + ': ', error);
        });

        this.device.on('message', (topic, payload) => {
            console.log('message ' + this.deviceName + ': ', topic, payload.toString());
        });
    }

    publish (data) {
        this.topics.forEach((element) => {
            console.log('pushing message to: ' + this.deviceName + ' element: ' + element + ' data: ', data);
            this.device.publish(element, JSON.stringify(data));
        }, this);
    }

    subscribe () {
        this.topics.forEach((element) => {
            console.log('subscribing device: ' + this.deviceName + ' element: ' + element);
            this.device.subscribe(element);
        }, this);
    }
}