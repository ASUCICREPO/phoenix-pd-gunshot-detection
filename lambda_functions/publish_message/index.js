var AWS = require('aws-sdk');  
AWS.config.region = 'us-west-2';

exports.handler = async (event) => {
    let long = event.long;
    let lat = event.lat;
    let googleUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
    let message = `Gunshot detected at ${googleUrl} .`;
    await publishSNS(message, process.env.TOPIC_ARN);
};

async function publishSNS(payload, topicArn) {
    var sns = new AWS.SNS();
    await sns.publish({
        Message: JSON.stringify(payload),
        TargetArn: topicArn
    }).promise().then((data) => {
        console.log('SNS push succeeded: ', data);
    }).catch((err) => {
        console.error(err);
    });
}
