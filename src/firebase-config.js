// Firebase Configuration for Esplanada Eats
// Story 0.1: Firebase Project Configuration

const firebaseConfig = {
  apiKey: "AIzaSyBL8Juo6PJQtFJx1KoJU7KGlc_OndCF3Ls",
  authDomain: "esplanada-eats.firebaseapp.com",
  projectId: "esplanada-eats",
  storageBucket: "esplanada-eats.firebasestorage.app",
  messagingSenderId: "403394772779",
  appId: "1:403394772779:web:8db461c61fc21f9e418f6e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Enable offline persistence for Firebase Compat SDK
firebase.firestore().enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    } else {
      console.error('Firebase persistence error:', err);
    }
  });

// Export Firebase services for use in other modules
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebase, db, storage, auth };
} else if (typeof window !== 'undefined') {
  window.EsplanadaEatsFirebase = { firebase, db, storage, auth };
}