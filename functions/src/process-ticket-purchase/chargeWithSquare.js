const functions = require("firebase-functions");
const crypto = require("crypto");
const { ApiError, Client, Environment } = require("square");

module.exports = async (purchaseSnap) => {
  const idempotencyKey = crypto.randomBytes(22).toString("hex");
  const purchase = purchaseSnap.data();
  const squareAccessToken = functions.config().square.token;
  const squareEnv = functions.config().square.env;
  const golfTicketCost = functions.config().tournament.golfer_ticket_cost;
  const dinnerTicketCost = functions.config().tournament.dinner_ticket_cost;

  const squareClient = new Client({
    environment:
      squareEnv === "sandbox" ? Environment.Sandbox : Environment.Production,
    accessToken: squareAccessToken,
  });

  const golferCount = purchase.golfers.length;
  const dinnerCount = purchase.extraDinners;

  const amount =
    golferCount * golfTicketCost +
    dinnerCount * dinnerTicketCost +
    (purchase.ccDonate ? 200 : 0) -
    (golferCount === 4 ? 10000 : 0);

  const payment = {
    idempotencyKey,
    sourceId: purchase.squarePurchase.sourceId,
    locationId: purchase.squarePurchase.locationId,
    amountMoney: {
      amount,
      currency: "USD",
    },
    buyerEmailAddress: purchase.email,
  };

  try {
    const { result, statusCode } = await squareClient.paymentsApi.createPayment(
      payment
    );

    console.info(`Square status response: ${statusCode}`);

    await purchaseSnap.ref.update({
      createdAt: new Date(),
      squarePurchase: result,
    });

    return result;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(err.result);
    } else {
      console.error(err);
    }

    throw err;
  }
};
