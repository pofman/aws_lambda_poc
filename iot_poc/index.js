'use strict';

const VIRTUAL = true;
const PHYSICAL = false;

const express = require('express'),
    request = require('request'),
    aws4 =require('aws4'),
    five = require('johnny-five'),
    devicesConfig = require('./config/config'),
    LedLight = require('./src/LedLight'),
    LedLightShadow = require('./src/LedLightShadow'),
    MonitorDevice = require('./src/MonitorDevice');

const app = express();
let board = new five.Board();
let button,
    led,
    ledStatus = 0,
    oneLight,
    lightsMonitor;

let turnOnTheLights = (isVirtual) => {
    if (isVirtual) {
        oneLight.turnLedOn();
    } else {
        led.on();
        ledStatus = 1;
        oneLight.reportLedOn();
    }
}

let turnOffTheLights = (isVirtual) => {
    if (isVirtual) {
        oneLight.turnLedOff();
    }
    else {
        led.off();
        ledStatus = 0;
        oneLight.reportLedOff();
    }
}

let initializeAwsDevices = () => {
    oneLight = new LedLightShadow('led-light',
        ['light_status'],
        devicesConfig.ledLight.keyPath,
        devicesConfig.ledLight.certPath,
        devicesConfig.ledLight.caPath,
        devicesConfig.ledLight.clientId,
        devicesConfig.ledLight.host, {
            light: 'led-light',
            status: ledStatus.toString()
        }
    );

    oneLight.initialize();

    lightsMonitor = new MonitorDevice('testLigthMonitor',
        ['light_status'],
        devicesConfig.monitor.keyPath,
        devicesConfig.monitor.certPath,
        devicesConfig.monitor.caPath,
        devicesConfig.monitor.clientId,
        devicesConfig.monitor.host, {}
    );

    lightsMonitor.initialize();
    lightsMonitor.subscribe();
    lightsMonitor.registerShadowDevice(oneLight.deviceName, (err, failedTopics) => {
        console.log('light on monitor registered');
    });

    oneLight.subscribeToEvent('delta', (thingName, stateObject) => {
        if (thingName == oneLight.deviceName) {
            console.log('there is a delta: ', stateObject);
            if (stateObject.state.status == 1) {
                turnOnTheLights(PHYSICAL);
            } else if (stateObject.state.status == 0) {
                turnOffTheLights(PHYSICAL);
            }
        }
    });
}

board.on('ready', () => {
    button = new five.Button(2);
    led = new five.Led(5);

    board.repl.inject({
        button: button,
        led: led
    });

    initializeAwsDevices();

    // "down" the button is pressed
    button.on('down', () => {
        console.log('down');
        if (ledStatus == 0) {
            turnOnTheLights(PHYSICAL);
        }
        else if (ledStatus == 1) {
            turnOffTheLights(PHYSICAL);
        }
        else {
            turnOffTheLights(PHYSICAL);
        }
    });

    // "hold" the button is pressed for specified time.
    //        defaults to 500ms (1/2 second)
    //        set
    button.on('hold', () => {
        console.log('hold');
    });

    // "up" the button is released
    button.on('up', () => {
        console.log('up');
    });
});

app.get('/turnOnLight', (req, res) => {
    turnOnTheLights(VIRTUAL);
    res.json({
        status: 'light on'
    });
});

app.get('/turnOffLight', (req, res) => {
    turnOffTheLights(VIRTUAL);
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

process.on('SIGINT', () => {
    led.off();
});
