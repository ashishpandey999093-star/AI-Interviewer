
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyBBKY6MK_nCd0eTUBlFgfO-XZfh3ThtZWM",
  authDomain: "ai-interviewer-55ca1.firebaseapp.com",
  projectId: "ai-interviewer-55ca1",
  storageBucket: "ai-interviewer-55ca1.firebasestorage.app",
  messagingSenderId: "39191716221",
  appId: "1:39191716221:web:181ddea313f4325aa16c14",
  measurementId: "G-KNCPL1BYDX"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }