// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getAnalytics, Analytics } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjPmODrdEiuNAhDVtnnGEzD-Q_GqtuXJw",
  authDomain: "co-ventures-prod.firebaseapp.com",
  projectId: "co-ventures-prod",
  storageBucket: "co-ventures-prod.firebasestorage.app",
  messagingSenderId: "311486829236",
  appId: "1:311486829236:web:c691af0460b3784371fde1",
  measurementId: "G-85ZXMHSFXJ"
}

// Initialize Firebase (singleton pattern to avoid re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase Auth
const auth = getAuth(app)

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export { app, auth, analytics }
