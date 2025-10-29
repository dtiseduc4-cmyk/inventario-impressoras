// firebase.js — inicialização do Firebase e Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWMeGoDass7ZZKbsN7ogX7ZKxTTApprtg",
  authDomain: "inventario-impressoras-2ecbd.firebaseapp.com",
  projectId: "inventario-impressoras-2ecbd",
  storageBucket: "inventario-impressoras-2ecbd.firebasestorage.app",
  messagingSenderId: "993025022167",
  appId: "1:993025022167:web:94c62eac0cfa96ddc1f892",
  measurementId: "G-459GNX2RGH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

