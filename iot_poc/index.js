'use strict';

const VIRTUAL = true;
const PHYSICAL = false;

const express = require('express'),
    five = require('johnny-five'),
    devicesConfig = require('./config/config'),
    LedLightShadow = require('./src/LedLightShadow'),
    MonitorDevice = require('./src/MonitorDevice'),
    ThingAPI = require('./src/ThingAPI'),
    PhotoTransistorDevice = require('./src/PhotoTransistorDevice'),
    Button = require('./src/Button');

const app = express();
let board = new five.Board();
let button,
    oneLight,
    lightsMonitor,
    photoTransistor;

let initializeAwsDevices = () => {
    oneLight = new LedLightShadow('led-light',
        ['light_status'],
        devicesConfig.ledLight.keyPath,
        devicesConfig.ledLight.certPath,
        devicesConfig.ledLight.caPath,
        devicesConfig.ledLight.clientId,
        devicesConfig.ledLight.host, {
            light: 'led-light',
            status: 0
        }
    );
    oneLight.initialize();
    oneLight.initializePhysical({
        pin: '5'
    });

    lightsMonitor = new MonitorDevice('testLigthMonitor',
        ['light_status', 'light_status_sensor'],
        devicesConfig.monitor.keyPath,
        devicesConfig.monitor.certPath,
        devicesConfig.monitor.caPath,
        devicesConfig.monitor.clientId,
        devicesConfig.monitor.host, {}
    );

    lightsMonitor.initialize();
    lightsMonitor.subscribe();
    lightsMonitor.monitor(oneLight.deviceName);

    photoTransistor = new PhotoTransistorDevice('lightSensor',
        ['light_status_sensor'],
        devicesConfig.lightSensor.keyPath,
        devicesConfig.lightSensor.certPath,
        devicesConfig.lightSensor.caPath,
        devicesConfig.lightSensor.clientId,
        devicesConfig.lightSensor.host, {}
    );
    photoTransistor.initialize();
    photoTransistor.initializePhysicalSensor({
        pin: 'A1',
        freq: 10000
    });
    photoTransistor.within([ 700, 1023 ], (err, value) => {
        console.log('within data too much light: ', value);
    });

    photoTransistor.within([ 0, 150 ], (err, value) => {
        console.log('within data low light: ', value);
    });

    photoTransistor.onChange((data) => {
        console.log('light level', data.lux, data.level);
    });
}

board.on('ready', () => {
    button = new Button();
    button.initializePhysicalButton({ pin: 2 });

    initializeAwsDevices();

    button.onDown(() => {
        console.log('down');
        oneLight.changeLedStatus();
    });

    button.onHold(() => {
        console.log('hold');
    });

    button.onUp(() => {
        console.log('up');
    });

    board.repl.inject({
        button: button.instance,
        led: oneLight.led,
        photoTransistor: photoTransistor.sensor
    });
});

app.get('/turnOnLight', (req, res) => {
    oneLight.turnOnTheLights(VIRTUAL);
    res.json({
        status: 'light on'
    });
});

app.get('/turnOffLight', (req, res) => {
    oneLight.turnOffTheLights(VIRTUAL);
    res.json({
        status: 'light off'
    });
});

app.get('/lightShadowState', (req, res) => {
    new ThingAPI().getStatus(oneLight.deviceName, (err, response, body) => {
        if (err) {
            console.log('error request shadow state', err);
            return;
        }

        res.json(body);
    });
});

app.get('/lightSensorShadowState', (req, res) => {
    new ThingAPI().getStatus(photoTransistor.deviceName, (err, response, body) => {
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

process.on('SIGINT', () => {
    if (oneLight) {
        oneLight.dispose();
    }
});
