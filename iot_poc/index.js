'use strict';

let devicesConfig = require('./config/config');
let LedLight = require('./src/LedLight');

let oneLight = new LedLight(devicesConfig.ledLight.keyPath,
    devicesConfig.ledLight.certPath,
    devicesConfig.ledLight.caPath,
    devicesConfig.ledLight.clientId,
    devicesConfig.ledLight.host);

oneLight.register();