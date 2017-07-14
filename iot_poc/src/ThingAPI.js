'use strict'

let devicesConfig = require('./../config/config'),
    request = require('request'),
    aws4 =require('aws4');

module.exports = class ThingAPI {
    getStatus(thingName, callback) {
        let awsSign = aws4.sign({
            service: 'iotdata',
            region: devicesConfig.iotRestApi.region,
            method: 'GET',
            path: '/things/' + thingName + '/shadow',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'Host': devicesConfig.iotRestApi.host
            }
        }, {
            secretAccessKey: devicesConfig.iotRestApi.secretAccessKey,
            accessKeyId: devicesConfig.iotRestApi.accessKeyId
        });

        awsSign.url = 'https://' + awsSign.hostname + awsSign.path;

        request(awsSign, callback);
    }
}