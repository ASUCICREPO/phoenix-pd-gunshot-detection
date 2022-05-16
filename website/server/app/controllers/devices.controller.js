const AWS = require("aws-sdk");
const config = require("../../config");

exports.getDevices = (req, res) => {
  AWS.config.update(config.aws_remote_config);

  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: config.aws_table_2_name,
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
        devices: Items,
      });
    }
  });
};
