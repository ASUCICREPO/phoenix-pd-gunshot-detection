const AWS = require("aws-sdk");
const config = require("../../config");

AWS.config.update(config.aws_remote_config);

const docClient = new AWS.DynamoDB.DocumentClient();

exports.getUser = async (email) => {

  const params = {
    TableName: config.user_detail_table,
    Key: {
        email: email ,
      },
  };

  return await docClient
  .get(params)
  .promise()
  .then(
    (response) => {
        return response.Item;
    },
    (error) => {
        console.log("error fetching user",error);
    }
  );
};


