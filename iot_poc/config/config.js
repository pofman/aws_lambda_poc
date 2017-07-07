'use strict'

var _ = require('lodash'),
    fs = require('fs'),
    glob = require('glob'),
    path = require('path');

var validateEnvironmentVariable = function () {
    var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '-devices.js');
    console.log();
    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error(chalk.red('+ Error: No devices configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
        } else {
            console.error(chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'));
        }
        process.env.NODE_ENV = 'development';
    }
};

function initConfig() {
    validateEnvironmentVariable();

    var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV + '-devices')) || {};

    var config = _.merge(environmentConfig, (fs.existsSync(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '-devices.js')) && require(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '-devices.js'))) || {});

    return config;
}

module.exports = initConfig();