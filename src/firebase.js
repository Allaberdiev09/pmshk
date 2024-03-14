import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyi7VadvVXAccPmV_U0YeuvOTVrI7adYY",
  authDomain: "twelveklaus-ae5b2.firebaseapp.com",
  projectId: "twelveklaus-ae5b2",
  storageBucket: "twelveklaus-ae5b2.appspot.com",
  messagingSenderId: "616998549098",
  appId: "1:616998549098:web:2a37634141d6075eabbc13",
  measurementId: "G-BQQHX5GD8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
