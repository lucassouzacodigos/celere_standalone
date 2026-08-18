// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0K5eNgiemHA8ct1BWVclA6r85SXKo__A",
    authDomain: "celere-analytics.firebaseapp.com",
    projectId: "celere-analytics",
    storageBucket: "celere-analytics.firebasestorage.app",
    messagingSenderId: "197265126128",
    appId: "1:197265126128:web:955f1b9ec6e1091ca58835"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db