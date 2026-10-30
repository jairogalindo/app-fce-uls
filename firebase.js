import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVQlg7h9cZU1TM5xJqJUOY4Hya1ln4Ngo",
  authDomain: "gen-lang-client-0772807160.firebaseapp.com",
  projectId: "gen-lang-client-0772807160",
  storageBucket: "gen-lang-client-0772807160.firebasestorage.app",
  messagingSenderId: "954592481327",
  appId: "1:954592481327:web:78c8f4b4987075c6c576da",
  measurementId: "G-S79R17HDND"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-posgradosfceuls-8d199ac6-993e-4539-ae7b-1ed582efed9c");

export { db };