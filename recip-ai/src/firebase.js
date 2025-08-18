import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration ---
// NOTE: You would replace this with your actual Firebase config object
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwDUTWxAEPViQoOB3D6njAIcqeErMIQnc",
  authDomain: "recip-ai-92236.firebaseapp.com",
  projectId: "recip-ai-92236",
  storageBucket: "recip-ai-92236.firebasestorage.app",
  messagingSenderId: "669133228187",
  appId: "1:669133228187:web:65e8ebc0cc03bd914f9e3e"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- App-specific Config ---
// NOTE: In a real app, you might get this from environment variables.
// In the original artifact, this was provided by the environment.
export const appId = 'default-recipe-app';
