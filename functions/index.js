const admin = require("firebase-admin");

admin.initializeApp();

const processSponsorPurchase = require("./src/process-sponsor-purchase");
const processTicketPurchase = require("./src/process-ticket-purchase");

exports.processSponsorPurchase = processSponsorPurchase;
exports.processTicketPurchase = processTicketPurchase;
