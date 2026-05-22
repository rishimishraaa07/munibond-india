/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase Configuration provided by user
const firebaseConfig = { 
  apiKey: "AIzaSyA6-3ux4At6MdwaN6ijca7HS8KMZ-S00MU", 
  authDomain: "munibond-india.firebaseapp.com", 
  projectId: "munibond-india", 
  storageBucket: "munibond-india.firebasestorage.app", 
  messagingSenderId: "834263881508", 
  appId: "1:834263881508:web:e3711553d8b081fa3bc5b1", 
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Auth Error:", error.code, error.message);
    throw error;
  }
};
