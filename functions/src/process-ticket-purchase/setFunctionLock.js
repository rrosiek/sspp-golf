const admin = require("firebase-admin");

const TransactionLockError = require("../errors/transactionLockError");

const db = admin.firestore();

module.exports = async (purchaseSnap, context) => {
  const ref = purchaseSnap.ref;

  if (!context.params.purchaseId) {
    throw Error("No function transaction purchase ID, undefined");
  }

  return db.runTransaction(async (t) => {
    const doc = await t.get(ref);

    if (!doc.data().createActionTransactionId) {
      await t.update(ref, {
        createActionTransactionId: context.params.purchaseId,
      });
    } else {
      throw new TransactionLockError("Function has already been run, exiting");
    }
  });
};
