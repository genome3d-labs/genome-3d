import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbg5FjbC9czcifprfxmsRWeYttXL54uho",
  authDomain: "genome-3d.firebaseapp.com",
  projectId: "genome-3d",
  storageBucket: "genome-3d.firebasestorage.app",
  messagingSenderId: "987270159575",
  appId: "1:987270159575:web:ffa31f2d786e039e2ba492"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
