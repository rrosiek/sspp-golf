const AWS = require("aws-sdk");
const functions = require("firebase-functions");
const emailTemplate = require("../email-templates/ticket-error-notice");

const adminEmail = functions.config().tournament.admin_email;

module.exports = async (purchase) => {
  AWS.config.update({
    credentials: new AWS.Credentials(
      functions.config().aws.ses_key,
      functions.config().aws.ses_secret
    ),
    region: "us-east-1",
  });

  const html = emailTemplate({ adminEmail }).html;

  return new AWS.SES()
    .sendEmail({
      Destination: { ToAddresses: [purchase.email], CcAddresses: [adminEmail] },
      Source: functions.config().tournament.from_email,
      Message: {
        Body: { Html: { Charset: "UTF-8", Data: html } },
        Subject: {
          Charset: "UTF-8",
          Data: "SSPP Golf Tournament - Error Processing Payment",
        },
      },
    })
    .promise();
};
