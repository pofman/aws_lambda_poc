'use strict';

const express = require('express');
const app = express();
let request = require('request');
let aws4 =require('aws4');

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
lightsMonitor.registerShadowDevice(oneLight.deviceName, (err, failedTopics) => {
    console.log('light on monitor registered');
});

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

app.get('/lightShadowState', (req, res) => {
    let awsSign = aws4.sign({
        service: 'iotdata',
        region: devicesConfig.iotRestApi.region,
        method: 'GET',
        path: '/things/' + oneLight.deviceName + '/shadow',
        headers: {
            'Content-Type': 'application/x-amz-json-1.0',
            'Host': devicesConfig.iotRestApi.host
        }
    }, {
        secretAccessKey: devicesConfig.iotRestApi.secretAccessKey,
        accessKeyId: devicesConfig.iotRestApi.accessKeyId
    });

    awsSign.url = 'https://' + awsSign.hostname + awsSign.path;

    request(awsSign, (err, response, body) => {
        if (err) {
            console.log('error request shadow state', err);
            return;
        }

        res.json(body);
    });
});

app.listen(3000, () => {
    console.log('Iot app listening on port 3000!');
});

// setInterval(() => {
//     let currentState = lightsMonitor.get(oneLight.deviceName);
//     console.log('this cames from shadow: ', currentState);
// }, 5000);
