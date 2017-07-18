var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {
    var tableName = "ligthSensorStream";
    var datetime = new Date().getTime().toString();

    console.log('event call records:', event.Records);

    event.Records.forEach((record) => {
        // Kinesis data is base64 encoded so decode here
        var payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
        console.log('Decoded payload:', payload);
        console.log('event call light value: ', payload.sensor);
        console.log('event call status value: ', payload.level);
    });

    // dynamodb.getItem({
    //     TableName: tableName,
    //     Key: {
    //         'sensor' : { "S": event.sensor }
    //     },
    //     ProjectionExpression: 'sensor'
    // }, function(err, data) {
    //     if(err) {
    //         callback(null, {
    //             body: JSON.stringify({
    //                 sensor: event.sensor,
    //                 level: event.level,
    //                 message: err
    //             }),
    //             statusCode: 500,
    //             headers: {
    //                 "Access-Control-Allow-Origin" : "*",
    //                 "Access-Control-Allow-Credentials" : true
    //             }
    //         });
    //     } else {
    //         if (data.Item) {
    //             dynamodb.updateItem({
    //                 "TableName": tableName,
    //                 "Key" : {
    //                     "sensor": { S: event.sensor }
    //                 },
    //                 "UpdateExpression" : "SET #date = :dateValue, #level = :levelValue",
    //                 "ExpressionAttributeNames" : {
    //                     "#date" : "date",
    //                     "#level": "level"
    //                 },
    //                 "ExpressionAttributeValues" : {
    //                     ":dateValue" : { "S" : datetime },
    //                     ":levelValue" : { "N" : event.level },
    //                 }
    //                 }, function(err, data) {
    //                 if (err) {
    //                     callback(null, {
    //                         body: JSON.stringify({
    //                             sensor: event.sensor,
    //                             level: event.level,
    //                             mesasge: err
    //                         }),
    //                         statusCode: 500,
    //                         headers: {
    //                             "Access-Control-Allow-Origin" : "*",
    //                             "Access-Control-Allow-Credentials" : true
    //                         }
    //                     });
    //                 } else {
    //                     callback(null, {
    //                         body: JSON.stringify({
    //                             sensor: event.sensor,
    //                             level: event.level,
    //                             mesasge: 'existing item'
    //                         }),
    //                         statusCode: 200,
    //                         headers: {
    //                             "Access-Control-Allow-Origin" : "*",
    //                             "Access-Control-Allow-Credentials" : true
    //                         }
    //                     });
    //                 }
    //             });
    //         } else {
    //             dynamodb.putItem({
    //                 "TableName": tableName,
    //                 "Item" : {
    //                     "sensor": { S: event.sensor },
    //                     "date": { S: datetime },
    //                     "level": { N: event.level }
    //                 }
    //                 }, function(err, data) {
    //                 if (err) {
    //                     callback(null, {
    //                         body: JSON.stringify({
    //                             sensor: event.sensor,
    //                             level: event.level,
    //                             mesasge: err
    //                         }),
    //                         statusCode: 500,
    //                         headers: {
    //                             "Access-Control-Allow-Origin" : "*",
    //                             "Access-Control-Allow-Credentials" : true
    //                         }
    //                     });
    //                 } else {
    //                     callback(null, {
    //                         body: JSON.stringify({
    //                             sensor: event.sensor,
    //                             level: event.level,
    //                             mesasge: 'new item'
    //                         }),
    //                         statusCode: 200,
    //                         headers: {
    //                             "Access-Control-Allow-Origin" : "*",
    //                             "Access-Control-Allow-Credentials" : true
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     }
    // });
};