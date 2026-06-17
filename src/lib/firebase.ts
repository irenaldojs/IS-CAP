import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCDKrkVth0MSjw-mFU_mhk7LH2x-8W5u_8",
  authDomain: "is-cap.firebaseapp.com",
  projectId: "is-cap",
  storageBucket: "is-cap.firebasestorage.app",
  messagingSenderId: "604878390999",
  appId: "1:604878390999:web:2c0b74c150d4b0c3479292",
  measurementId: "G-S8Y40VG6LZ"
};

// Inicializa o Firebase apenas uma vez (evita erros no hot reload de desenvolvimento)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializa o Analytics de forma segura apenas no lado do cliente (browser)
let analytics: any = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.error("Firebase Analytics não é suportado:", err);
  });
}

export { app, analytics };
