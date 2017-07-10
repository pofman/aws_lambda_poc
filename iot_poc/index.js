'use strict';

const express = require('express');
const app = express();

let devicesConfig = require('./config/config');
let LedLight = require('./src/LedLight');
let MonitorDevice = require('./src/MonitorDevice');

let oneLight = new LedLight('testLigth',
    ['light_status'],
    devicesConfig.ledLight.keyPath,
    devicesConfig.ledLight.certPath,
    devicesConfig.ledLight.caPath,
    devicesConfig.ledLight.clientId,
    devicesConfig.ledLight.host);

let lightsMonitor = new MonitorDevice('testLigthMonitor',
    ['light_status'],
    devicesConfig.ledLight.keyPath,
    devicesConfig.ledLight.certPath,
    devicesConfig.ledLight.caPath,
    devicesConfig.ledLight.clientId,
    devicesConfig.ledLight.host);

lightsMonitor.subscribe();

app.get('/turnOnLight', function (req, res) {
    oneLight.turnLedOn();
    res.json({
        status: 'light on'
    });
});

app.get('/turnOffLight', function (req, res) {
    oneLight.turnLedOff();
    res.json({
        status: 'light off'
    });
});

app.listen(3000, function () {
    console.log('Iot app listening on port 3000!');
});