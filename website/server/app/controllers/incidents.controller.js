const AWS = require("aws-sdk");
const config = require("../../config");

exports.incidentTest = (req, res) => {
  res.json({
    message: "success test api",
  });
};

exports.getIncidents = (req, res) => {
  AWS.config.update(config.aws_remote_config);

  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: config.aws_table_name,
  };

  docClient.scan(params, function (err, data) {
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
      TableName: config.aws_table_name,
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
      TableName: config.aws_table_4_name,
      Item: {
        device_id: device_id,
        notification: notification,
        timestamp: Date.now(),
      },
    };
  }

  docClient.put(params, function (err, data) {
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
      // this is for testing purposes only
      // const lambda = new AWS.Lambda();
      // params = {
      //   FunctionName: "publishMessages" /* required */,
      //   Payload: JSON.stringify({ lat: 28.7041, long: 77.1025 }),
      // };
      // lambda.invoke(params, function (err, data) {
      //   if (err) console.log(err, err.stack); // an error occurred
      //   else console.log("INVOKED LAMBDA ", data); // successful response
      // });
    }
  });
};

exports.getLocations = (req, res) => {
  console.log("GOT HERE");
  AWS.config.update(config.aws_remote_config);

  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: config.aws_table_2_name,
  };

  docClient.scan(params, function (err, data) {
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
