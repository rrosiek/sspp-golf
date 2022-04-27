const functions = require("firebase-functions");
const crypto = require("crypto");
const { ApiError, Client, Environment } = require("square");

module.exports = async (purchaseSnap) => {
  const idempotencyKey = crypto.randomBytes(22).toString("hex");
  const purchase = purchaseSnap.data();
  const squareAccessToken = functions.config().square.token;
  const squareEnv = functions.config().square.env;
  const sponsorPresenting = functions.config().tournament.sponsor_presenting;
  const sponsorAce = functions.config().tournament.sponsor_ace;
  const sponsorEagle = functions.config().tournament.sponsor_eagle;
  const sponsorBirdie = functions.config().tournament.sponsor_birdie;
  const sponsorHole = functions.config().tournament.sponsor_hole;
  const sponsorMemory = functions.config().tournament.sponsor_memory;

  const squareClient = new Client({
    environment:
      squareEnv === "sandbox" ? Environment.Sandbox : Environment.Production,
    accessToken: squareAccessToken,
  });

  const sponsorOptions = {
    sponsor_presenting: sponsorPresenting,
    sponsor_ace: sponsorAce,
    sponsor_eagle: sponsorEagle,
    sponsor_birdie: sponsorBirdie,
    sponsor_hole: sponsorHole,
    sponsor_memory: sponsorMemory,
  };

  const payment = {
    idempotencyKey,
    sourceId: purchase.squarePurchase.sourceId,
    locationId: purchase.squarePurchase.locationId,
    amountMoney: {
      amount: sponsorOptions[purchase.sponsorId],
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

    return [false, result];
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(err.result);
    } else {
      console.error(err);
    }

    return [err, false];
  }
};
