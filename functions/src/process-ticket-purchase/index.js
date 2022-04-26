const functions = require("firebase-functions");
const chargeWithSquare = require("./chargeWithSquare");
const mailAdminNotice = require("./mailAdminNotice");
const mailReceipt = require("./mailReceipt");
const setFunctionLock = require("./setFunctionLock");
const TransactionLockError = require("../errors/transactionLockError");

module.exports = functions.firestore
  .document("ticket_purchases/{purchaseId}")
  .onCreate(async (purchaseSnap, context) => {
    console.log("Setting function transaction lock");
    try {
      await setFunctionLock(purchaseSnap, context);
    } catch (error) {
      if (error instanceof TransactionLockError) {
        console.error(error.message);

        return null;
      } else {
        throw error;
      }
    }

    console.info("Charging card with square");
    const squareCharge = await chargeWithSquare(purchaseSnap);

    console.info("Sending receipt via email");
    await mailReceipt(purchaseSnap.id, purchaseSnap.data(), squareCharge);

    console.info("Sending notification email to admin");
    await mailAdminNotice(purchaseSnap.id, purchaseSnap.data(), squareCharge);

    return null;
  });
