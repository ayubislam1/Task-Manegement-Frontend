import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAP7RFbB3PvYOtBlrzRdJMRjBBOTlB__tM",
  authDomain: "task-management-a29e4.firebaseapp.com",
  projectId: "task-management-a29e4",
  storageBucket: "task-management-a29e4.firebasestorage.app",
  messagingSenderId: "223629722903",
  appId: "1:223629722903:web:f25e7d8d2b33e469782352",
  measurementId: "G-LVC48S3VSF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  export default auth;