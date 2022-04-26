module.exports = class TransactionLockError extends Error {
  constructor(message) {
    super(message);
    this.name = "TransactionLockError";
  }
};
