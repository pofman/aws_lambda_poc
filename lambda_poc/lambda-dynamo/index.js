console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {
    var tableName = "lightsStatus";
    var datetime = new Date().getTime().toString();

    dynamodb.getItem({
        TableName: tableName,
        Key: {
            'light' : { "S": event.light }
        },
        ProjectionExpression: 'light'
    }, function(err, data) {
        if(err) {
            callback(null, {
                body: JSON.stringify({
                    light: event.light,
                    status: event.status,
                    message: err
                }),
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin" : "*",
                    "Access-Control-Allow-Credentials" : true
                }
            });
        } else {
            if (data.Item) {
                dynamodb.updateItem({
                    "TableName": tableName,
                    "Key" : {
                        "light": { S: event.light }
                    },
                    "UpdateExpression" : "SET #date = :dateValue, #status = :statusValue",
                    "ExpressionAttributeNames" : {
                        "#date" : "date",
                        "#status": "status"
                    },
                    "ExpressionAttributeValues" : {
                        ":dateValue" : { "S" : datetime },
                        ":statusValue" : { "N" : event.status },
                    }
                    }, function(err, data) {
                    if (err) {
                        callback(null, {
                            body: JSON.stringify({
                                light: event.light,
                                status: event.status,
                                mesasge: err
                            }),
                            statusCode: 500,
                            headers: {
                                "Access-Control-Allow-Origin" : "*",
                                "Access-Control-Allow-Credentials" : true
                            }
                        });
                    } else {
                        callback(null, {
                            body: JSON.stringify({
                                light: event.light,
                                status: event.status,
                                mesasge: 'existing item'
                            }),
                            statusCode: 200,
                            headers: {
                                "Access-Control-Allow-Origin" : "*",
                                "Access-Control-Allow-Credentials" : true
                            }
                        });
                    }
                });
            } else {
                dynamodb.putItem({
                    "TableName": tableName,
                    "Item" : {
                        "light": { S: event.light },
                        "date": { S: datetime },
                        "status": { N: event.status }
                    }
                    }, function(err, data) {
                    if (err) {
                        callback(null, {
                            body: JSON.stringify({
                                light: event.light,
                                status: event.status,
                                mesasge: err
                            }),
                            statusCode: 500,
                            headers: {
                                "Access-Control-Allow-Origin" : "*",
                                "Access-Control-Allow-Credentials" : true
                            }
                        });
                    } else {
                        callback(null, {
                            body: JSON.stringify({
                                light: event.light,
                                status: event.status,
                                mesasge: 'new item'
                            }),
                            statusCode: 200,
                            headers: {
                                "Access-Control-Allow-Origin" : "*",
                                "Access-Control-Allow-Credentials" : true
                            }
                        });
                    }
                });
            }
        }
    });
};