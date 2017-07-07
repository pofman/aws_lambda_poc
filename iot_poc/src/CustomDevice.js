'use strict';

let awsIot = require('aws-iot-device-sdk');

module.exports = class CustomDevice {
    constructor(keyPath, certPath, caPath, clientId, host){
        this.keyPath = keyPath;
        this.certPath = certPath;
        this.caPath = caPath;
        this.clientId = clientId;
        this.host = host;

        this.device = awsIot.device({
            keyPath: this.keyPath,
            certPath: this.certPath,
            caPath: this.caPath,
            clientId: this.clientId,
            host: this.host
        });
    }

    register() {
    }
}