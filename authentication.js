import {initializeApp} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"
import {getFirestore, collection, addDoc, setDoc, deleteDoc, getDocs, query, where, doc} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"

const firebaseConfig = {
  apiKey: "AIzaSyDkByrSinwKhhvwP9kxCv-A8GKtUwjpa1s",
  authDomain: "ceramicsstudiodev.firebaseapp.com",
  projectId: "ceramicsstudiodev",
  storageBucket: "ceramicsstudiodev.firebasestorage.app",
  messagingSenderId: "506800538897",
  appId: "1:506800538897:web:a43e49999a29012e0978b0"
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth()
/**
 * Student authenticate functions that checks the user's credentials using Firebase Auth
 * and sends them to the landing page if they are incorrect
 * @author Nico Zeisler
 */
export const authenticate = async function() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "index.html";
        }
    })
}
/**
 * Admin authenticate functions that checks the user's credentials using Firebase Auth
 * and sends them to the landing page if they are incorrect
 * @author Nico Zeisler
 */
export const adminAuthenticate = async function() {
    onAuthStateChanged(auth, (user) => {
        if (!(user && user.email == "sbrodie@stab.org")) {
            window.location.href = "index.html";
        }
    })
}
/**
 * Logs the user in using Firebase Authentication services. If the password matches any found student 
 * accounts it continues to studentLogin, otherwise it alerts for unrecognized email or invalid password. 
 * If the password and email match Ms. Brodie's, it credentials the user and sends them to the first bisque page.
 * @author Nico Zeisler
 */
export const login = async function() {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user
        if (email == "sbrodie@stab.org") {
            window.location.href = "firstBisque.html"
        }
        else {
            studentLogin(email)
        }
    })
    .catch((error) => {
        alert(error.message)
        return
    })
}
/**
 * Helper function to setup the user's session storage with the necessary data and credentials
 * and redirect them to the proper place depending on whether they currently have a submitted
 * piece or not. If their piece was rejected, it notifies them and then redirects them to the form.
 * @author Nico Zeisler
 * @param {String} email - The student's email
 */
async function studentLogin(email) {
    const snap = await getDocs(query(collection(db, "rejected"), where("email", "==", email)))
    const user = await getDocs(query(collection(db, "accounts"), where("email", "==", email)))
    const name = user.docs[0].data().name
    if (!snap.empty) {
      for (const docSnap of snap.docs) {
        const reason = docSnap.data().text
        alert(reason)
        await deleteDoc(doc(db, "rejected", docSnap.id))
      }
    }
    sessionStorage.setItem("email", email)
    sessionStorage.setItem("name", name)
    window.location.href = "form.html"
}
/**
 * Signup function that takes user input from the form for name and email and checks to 
 * see if they seem normal (i.e name is purely alphabetic) and alert otherwise. If everything
 * was acceptable it adds the account to Firebase Auth and the accoutns database and redirects the user to login
 * @author Nico Zeisler
 */
export const signup = async function() {
    const username = document.getElementById("name").value
    if (!testAlphaNum(username)) {
      alert("Invalid Name")
      return
    }  
    const email = document.getElementById("email").value
    if (!email.includes("@")) {
      alert("Invalid Email")
      return
    }
    const password = document.getElementById("password").value
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(db, "accounts", user.uid), {
            uid: user.uid,
            email: user.email, 
            name: username,
            num1stB: 0,
            num2ndB: 0,
            numGlaze: 0,
            leaderboard: 0
        })
        window.location.href = "index.html"
    })
    .catch((error) => {
        alert(error.message)
    });
}
/**
 * Utility to clear the user's session storage, revoke their credentials, and redirect them to the landing page
 * @author Nico Zeisler
 */
export const logout = async function() {
    signOut(auth)
    .then(() => {
        sessionStorage.clear()
        window.location.href = "index.html"
    })
    .catch((error) => {
        alert(error.message)
        sessionStorage.clear()
        window.location.href = "index.html"
    });
}
/**
* Utilities to test passwords and usernames and delete accounts who violate these conventions after the accounts
* have been created (looking at Jake)
* @author Nico Zeisler
*/
function testAlphaNum(string) {
  return /^[a-zA-Z0-9 ]+$/.test(string)
}
async function delAcc(id) {
  await deleteDoc(doc(db, "accounts", id))
}  
