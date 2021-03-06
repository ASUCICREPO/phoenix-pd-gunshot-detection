const AWS = require("aws-sdk");
const config = require("../../config");
const timeouts = {}

exports.incidentTest = (req, res) => {
    res.json({
        message: "success test api",
    });
};

exports.getIncidents = (req, res) => {
    AWS.config.update(config.aws_remote_config);

    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: config.raw_data_table,
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: err,
            });
        } else {
            const { Items } = data;
            res.json({
                success: true,
                incidents: Items,
            });
        }
    });
};


function publishMessage() {
    var params = {
        Message: 'Trigger triangulation',
        TopicArn: config.triangulation_arn
    }

    var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    publishTextPromise.then(
        function(data) {
            console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
            delete timeouts[1]
        }).catch(
        function(err) {
            console.error(err, err.stack);
        }
    );
}

exports.uploadIncident = (req, res) => {
    let s3url = "";
    const device_id = req.body.device_id;
    const notification = req.body.notification;

    if (req.body.s3_url) {
        s3url = req.body.s3_url;
    }

    AWS.config.update(config.aws_remote_config);

    const docClient = new AWS.DynamoDB.DocumentClient();

    let params = {};

    if (s3url !== "") {
        console.log("gunshot detected!");
        params = {
            TableName: config.raw_data_table,
            Item: {
                device_id: device_id,
                s3_url: s3url,
                notification: notification,
                timestamp: Date.now(),
                is_processed: false,
            },
        };
    } else {
        console.log("Booting devices!");
        params = {
            TableName: config.device_location_table,
            Key: {"device_id": device_id},
            Item: {
                device_id: device_id,
                notification: notification,
                timestamp: Date.now(),
            },
        };
        console.log(params)

        docClient.update(params, function(err, data) {
            if (err) {
                console.log(err);
                console.log("\nFailed added item to the table");
                res.json({
                    success: false,
                    message: err,
                });
            } else {
                console.log("\nSuccessfully added item to the table");
                res.json({
                    success: true,
                });
            }
        });
        return 0;
    }

    docClient.put(params, function(err, data) {
        if (err) {
            console.log(err);
            console.log("\nFailed added item to the table");
            res.json({
                success: false,
                message: err,
            });
        } else {
            console.log("\nSuccessfully added item to the table");
            res.json({
                success: true,
            });
            console.log('data from put lora sensor')
            console.log(data)
            // if gunshot detected, put timer to call triangulation
            if (s3url !== "") {
                // check if timer is set
                console.log('timeouts', timeouts)
                if (timeouts[1]) {
                    clearTimeout(timeouts[1])
                    delete timeouts[1]
                }
                timeouts[1] = setTimeout(publishMessage, config.timeout_duration)
            }
        }
    });
};

exports.getLocations = (req, res) => {
    console.log("GOT HERE");
    AWS.config.update(config.aws_remote_config);

    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: config.triangulated_table,
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            console.log("ERROR!");
            console.log(err);
            res.json({
                success: false,
                message: err,
            });
        } else {
            console.log("GOT LOCATIONS!");
            const { Items } = data;
            res.json({
                success: true,
                locations: Items,
            });
        }
    });
};


exports.getRawLocations = (req, res) => {
    console.log("GOT HERE");
    AWS.config.update(config.aws_remote_config);

    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: config.raw_data_table,
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            console.log("ERROR!");
            console.log(err);
            res.json({
                success: false,
                message: err,
            });
        } else {
            console.log("GOT RAW LOCATIONS!");
            const { Items } = data;
            res.json({
                success: true,
                locations: Items,
            });
        }
    });
};