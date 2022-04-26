import {
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import { browser, dev } from "$app/env";
import type { AnyObject } from "$lib/types";

let app: FirebaseApp;
let db: Firestore;

export const initFirebase = async (options: FirebaseOptions) => {
  if (!app && browser) {
    app = initializeApp(options);
    db = getFirestore(app);

    if (dev) connectFirestoreEmulator(db, "localhost", 8080);
  }

  return;
};

export const getFirebaseApp = () => app;

export const saveSponsorPurchase = async (payload: AnyObject) => {
  await addDoc(collection(db, "sponsorships"), {
    ...payload,
  });
};

export const saveTicketPurchase = async (payload: AnyObject) => {
  await addDoc(collection(db, "ticket_purchases"), {
    ...payload,
    event: "golf_tournament",
  });
};
