// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getAnalytics, Analytics } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// use helper to get env var or default to dummy for build time robustness
const getEnv = (key: string, defaultVal: string = '') => {
  return process.env[key] || defaultVal
}

const firebaseConfig = {
  // Fallback to "mock_key" if env var is missing during build
  // This prevents build crashes when env vars are not yet set in Vercel
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'AIzaSyAjPmODrdEiuNAhDVtnnGEzD-Q_GqtuXJw'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'co-ventures-prod.firebaseapp.com'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'co-ventures-prod'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'co-ventures-prod.firebasestorage.app'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', '311486829236'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID', '1:311486829236:web:c691af0460b3784371fde1'),
  measurementId: getEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', 'G-85ZXMHSFXJ')
}

// Initialize Firebase (singleton pattern to avoid re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase Auth
const auth = getAuth(app)

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null
if (typeof window !== 'undefined') {
  try {
    // Only try to init analytics if we have real config, otherwise it might throw
    if (firebaseConfig.apiKey !== 'mock_key') {
      analytics = getAnalytics(app)
    }
  } catch (e) {
    console.warn('Firebase Analytics failed to initialize', e)
  }
}

export { app, auth, analytics }
