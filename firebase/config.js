// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJMhojec6G1AkQJh0ifiendwrEIvYGYxQ",
    authDomain: "roshancroos-97cdd.firebaseapp.com",
    projectId: "roshancroos-97cdd",
    storageBucket: "roshancroos-97cdd.firebasestorage.app",
    messagingSenderId: "906840504110",
    appId: "1:906840504110:web:8a603e41bfd725be616cbf",
    measurementId: "G-3JFH2485YV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
