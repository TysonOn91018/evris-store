// Firebase Console → Project settings → Your apps → Web app → SDK configuration.
// Public web configuration only. Never put an Admin SDK/service-account key here.
window.EVRIS_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAIbtFmwvOzvDAcr6vswURML5cOMN1Cgs0",
  authDomain: "ecsite-ba325.firebaseapp.com",
  projectId: "ecsite-ba325",
  storageBucket: "ecsite-ba325.firebasestorage.app",
  messagingSenderId: "24684058013",
  appId: "1:24684058013:web:c16bbe3a9c18c46a174b74",
  measurementId: "G-719J3Q4K8F",
};
// GitHub Pages uses the cloud service; local previews keep their local /api.
window.EVRIS_API_BASE = window.location.hostname === 'tysonon91018.github.io'
  ? 'https://evris-store.onrender.com'
  : '';
