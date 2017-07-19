var AWS = require('aws-sdk');
var async = require('async');
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {
    var tableName = "ligthSensorStream";
    var datetime = new Date().getTime().toString()

    let successfulRecords = [];
    let errorRecords = [];

    async.eachSeries(event.Records, (record) => {
        // Kinesis data is base64 encoded so decode here
        var payload = JSON.parse(new Buffer(record.kinesis.data, 'base64').toString('ascii'));

        if(!payload || !payload.sensor || !payload.level) {
            return;
        }

        console.log('Decoded payload:', payload);
        console.log('event call light value: ', payload.sensor);
        console.log('event call status value: ', payload.level);

        dynamodb.getItem({
            TableName: tableName,
            Key: {
                'sensor' : { "S": payload.sensor }
            },
            ProjectionExpression: 'sensor'
        }, function(err, data) {
            if(err) {
                console.log('error getting');
                errorRecords.push({
                    sensor: payload.sensor,
                    level: payload.level,
                    err: err
                });
            } else {
                console.log('getting');
                if (data.Item) {
                    dynamodb.updateItem({
                        "TableName": tableName,
                        "Key" : {
                            "sensor": { S: payload.sensor }
                        },
                        "UpdateExpression" : "SET #date = :dateValue, #level = :levelValue",
                        "ExpressionAttributeNames" : {
                            "#date" : "date",
                            "#level": "level"
                        },
                        "ExpressionAttributeValues" : {
                            ":dateValue" : { "S" : datetime },
                            ":levelValue" : { "N" : payload.level.toString() },
                        }
                        }, function(err, data) {
                        if (err) {
                            console.log('error updateing');
                            errorRecords.push({
                                sensor: payload.sensor,
                                level: payload.level,
                                err: err
                            });
                        } else {
                            console.log('updateing');
                            successfulRecords.push({
                                sensor: payload.sensor,
                                level: payload.level
                            });
                        }
                    });
                } else {
                    dynamodb.putItem({
                        "TableName": tableName,
                        "Item" : {
                            "sensor": { S: payload.sensor },
                            "date": { S: datetime },
                            "level": { N: payload.level.toString() }
                        }
                        }, function(err, data) {
                        if (err) {
                            console.log('error putting', err);
                            errorRecords.push({
                                sensor: payload.sensor,
                                level: payload.level,
                                err: err
                            });
                        } else {
                            console.log('putting');
                            successfulRecords.push({
                                sensor: payload.sensor,
                                level: payload.level
                            });
                        }
                    });
                }
            }
        });
    }, (err) => {
        if(err) {
            console.log('kabum: ', err);
            callback(err);
        }
        
        console.log('list of results: ', successfulRecords, errorRecords);
        callback(null, {
            successfulRecords: successfulRecords,
            errorRecords: errorRecords
        });
    });
};