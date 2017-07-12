'use strict';

const express = require('express');
const app = express();

let devicesConfig = require('./config/config');
let LedLight = require('./src/LedLight');
let LedLightShadow = require('./src/LedLightShadow');
let MonitorDevice = require('./src/MonitorDevice');

// let oneLight = new LedLight('led-light',
//     ['light_status'],
//     devicesConfig.ledLight.keyPath,
//     devicesConfig.ledLight.certPath,
//     devicesConfig.ledLight.caPath,
//     devicesConfig.ledLight.clientId,
//     devicesConfig.ledLight.host);


let oneLight = new LedLightShadow('led-light',
    ['light_status'],
    devicesConfig.ledLight.keyPath,
    devicesConfig.ledLight.certPath,
    devicesConfig.ledLight.caPath,
    devicesConfig.ledLight.clientId,
    devicesConfig.ledLight.host, {
        light: 'led-light',
        status: '0'
    });

oneLight.initialize();

let lightsMonitor = new MonitorDevice('testLigthMonitor',
    ['light_status'],
    devicesConfig.monitor.keyPath,
    devicesConfig.monitor.certPath,
    devicesConfig.monitor.caPath,
    devicesConfig.monitor.clientId,
    devicesConfig.monitor.host, {});

lightsMonitor.initialize();
lightsMonitor.subscribe();

app.get('/turnOnLight', (req, res) => {
    oneLight.turnLedOn();
    res.json({
        status: 'light on'
    });
});

app.get('/turnOffLight', (req, res) => {
    oneLight.turnLedOff();
    res.json({
        status: 'light off'
    });
});

app.listen(3000, function () {
    console.log('Iot app listening on port 3000!');
});

lightsMonitor.device.register(oneLight.deviceName, {}, (err, failedTopics) => {
    if (err || failedTopics) {
        console.log('error registering light on monitor', err, failedTopics);
        return;
    }

    console.log('light on monitor registered');
});

setInterval(() => {
    let currentState = lightsMonitor.get('led-light');
    console.log('this cames from shadow: ', currentState);
}, 5000);