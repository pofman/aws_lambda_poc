'use strict';

let CustomDevice = require('./CustomDevice');

module.exports = class LedLight extends CustomDevice {
    constructor(keyPath, certPath, caPath, clientId, host) {
        super(keyPath, certPath, caPath, clientId, host);

        this.device.on('connect', function() {
            console.log('connect');
            this.device.subscribe('topic_1');
            this.device.publish('topic_2', JSON.stringify({ test_data: 1 }));
        });

        this.device.on('message', function(topic, payload) {
            console.log('message', topic, payload.toString());
        });

        console.log(this.host);
    }
}