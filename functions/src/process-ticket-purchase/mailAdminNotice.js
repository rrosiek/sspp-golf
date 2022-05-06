const AWS = require("aws-sdk");
const functions = require("firebase-functions");
const emailTemplate = require("../email-templates/ticket-purchase-notice");

module.exports = async (purchaseId, purchase, squareCharge) => {
  AWS.config.update({
    credentials: new AWS.Credentials(
      functions.config().aws.ses_key,
      functions.config().aws.ses_secret
    ),
    region: "us-east-1",
  });

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  const html = emailTemplate({
    address: `${purchase.address} ${purchase.city}, ${purchase.state} ${purchase.zipCode}`,
    amount: moneyFormatter.format(
      Number(squareCharge.payment.amountMoney.amount) / 100
    ),
    email: purchase.email,
    id: purchaseId,
    name: purchase.name,
    phone: purchase.phone,
    golfers: purchase.golfers.reduce(
      (html, golfer) =>
        `${html}<li>${golfer.golferName}, ${golfer.golferContact}</li>`,
      ""
    ),
    dinnerTicketsPurchased: purchase.extraDinners,
  }).html;

  return new AWS.SES()
    .sendEmail({
      Destination: { ToAddresses: [functions.config().tournament.admin_email], CcAddresses: ["darcanm@amazon.com"] },
      Source: functions.config().tournament.from_email,
      Message: {
        Body: { Html: { Charset: "UTF-8", Data: html } },
        Subject: {
          Charset: "UTF-8",
          Data: "SSPP Golf Tournament - New Purchase",
        },
      },
    })
    .promise();
};
