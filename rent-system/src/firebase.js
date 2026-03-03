import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIbzi7sUNDjvL8idq2JhT3bcgm2KbZCXs",
  authDomain: "rentsystemtz.firebaseapp.com",
  projectId: "rentsystemtz",
  storageBucket: "rentsystemtz.firebasestorage.app",
  messagingSenderId: "329536498467",
  appId: "1:329536498467:web:40938f1377bd883390fa96"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);