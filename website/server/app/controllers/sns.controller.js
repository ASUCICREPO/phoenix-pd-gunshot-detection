const AWS = require("aws-sdk");
const config = require("../../config");

exports.subscribe = (req, res) => {
  const number = req.body.number;
  AWS.config.update(config.aws_remote_config);
  var sns = new AWS.SNS({ apiVersion: "2010-03-31" });
  const docClient = new AWS.DynamoDB.DocumentClient();
  let params = {
    Protocol: "sms",
    TopicArn: config.topicArn,
    Endpoint: number,
    ReturnSubscriptionArn: true,
  };
  sns.subscribe(params, function (err, data) {
    if (err) console.log("\n", err, err.stack);
    else {
      console.log("\nsuccessfully subscribed to topic");
      let subscriptionArn = data.SubscriptionArn;
      let params1 = {
        TableName: config.subscription_table,
        Item: {
          mobile_number: number,
          subscription_arn: subscriptionArn,
        },
      };

      docClient.put(params1, function (err, data) {
        if (err) {
          console.log("\n", err);
          console.log("\nfailed to add item to table");
          res.json({
            success: false,
            message: err,
          });
        } else {
          console.log("\nSuccessfully added item to table");
          res.json({
            success: true,
          });
        }
      });
    }
  });
};

exports.unsubscribe = (req, res) => {
  const number = req.body.number;
  let subscriptionArn = "";
  AWS.config.update(config.aws_remote_config);
  var sns = new AWS.SNS({ apiVersion: "2010-03-31" });
  const docClient = new AWS.DynamoDB.DocumentClient();
  let params = {
    TableName: config.subscription_table,
    Key: { mobile_number: number },
  };
  docClient.get(params, function (err, data) {
    if (err) {
      console.log("\n", err);
      console.log("\nfailed to get item from table");
      res.json({
        success: false,
        message: err,
      });
    } else {
      if (data.Item) {
        console.log("\nSuccessfully got item from table");

        subscriptionArn = data.Item.subscription_arn;
        let params1 = {
          SubscriptionArn: subscriptionArn,
        };
        sns.unsubscribe(params1, function (err, data) {
          if (err) console.log("\n", err, err.stack);
          else {
            console.log("\nsuccessfully unsubscribed from topic");
            docClient.delete(params, function (err, data) {
              if (err) {
                console.log("\n", err);
                console.log("\nfailed to remove item from table");
                res.json({
                  success: false,
                  message: err,
                });
              } else {
                console.log("\nSuccessfully removed item from table");
                res.json({
                  success: true,
                });
              }
            });
          }
        });
      } else {
        res.json({
          success: false,
          message: "That number does not exist in the table",
        });
      }
    }
  });
};
