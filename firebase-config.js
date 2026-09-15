import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-check.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyAbg5FjbC9czcifprfxmsRWeYttXL54uho",
  authDomain: "genome-3d.firebaseapp.com",
  projectId: "genome-3d",
  storageBucket: "genome-3d.firebasestorage.app",
  messagingSenderId: "987270159575",
  appId: "1:987270159575:web:ffa31f2d786e039e2ba492"
};


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);


// ==========================================
// FIREBASE APP CHECK + reCAPTCHA ENTERPRISE
// ==========================================

const appCheck = initializeAppCheck(app, {

  provider: new ReCaptchaEnterpriseProvider(
    "6Lc8mbgtAAAAAEeqgzzg9FK_fK-Foql9QGwg4v8r"
  ),

  isTokenAutoRefreshEnabled: true

});


// Authentication
const auth = getAuth(app);
const db = getFirestore(app);


export {
  app,
  auth,
  appCheck,
  db
};
