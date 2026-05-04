import {initializeApp} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"
import {getFirestore, collection, addDoc, deleteDoc, getDocs, query, where, doc} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyCAOfNj92YHafyu2sAdYSSsAPf5RcxZ2wg",
  authDomain: "ceramicsstudio-deb67.firebaseapp.com",
  projectId: "ceramicsstudio-deb67",
  storageBucket: "ceramicsstudio-deb67.firebasestorage.app",
  messagingSenderId: "1089998700895",
  appId: "1:1089998700895:web:03a77d724f88b03b8736ea",
  measurementId: "G-Q1W9FR3Z8C"
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Student authenticate functions that checks the user's session storage for credentials
 * and sends them to the landing page if they are incorrect
 * @author Nico Zeisler
 */
export const authenticate = async function() {
    const credentialed = sessionStorage.getItem("credentialed")
    if (credentialed == null || credentialed != "we're in!") {
        window.location.href = "index.html"
    }
}
/**
 * Admin authenticate functions that checks the user's session storage for credentials
 * and sends them to the landing page if they are incorrect
 * @author Nico Zeisler
 */
export const adminAuthenticate = async function() {
    const credentialed = sessionStorage.getItem("credentialed")
    if (credentialed == null || credentialed != "we're in admin!") {
        window.location.href = "index.html"
    }
}
/**
 * Receives inputs from the form and searches for the provided email in the accounts database.
 * If the password matches any found student accounts it continues to studentLogin, otherwise it 
 * alerts for unrecognized email or invalid password. If the password and email match Ms. Brodie's,
 * it credentials the user and sends them to the first bisque page.
 * @author Nico Zeisler
 */
export const login = async function() {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const snapshot = await getDocs(query(collection(db, "accounts"), where("email", "==", email)))
    if (!snapshot.empty) {
        for (const item of snapshot.docs) {
          if (password == item.data().password) {                                                                                                                                                                                      if (!(testAlphaNum(item.data().name))) { await delAcc(item.id); return;} 
                if (email == "sbrodie@stab.org") {
                    sessionStorage.setItem("credentialed", "we're in admin!")
                    window.location.href = "firstBisque.html"
                }
                else {
                    studentLogin(item, email)
                }
            }
            else {
                alert("Invalid Password")
            }
        }  
    }
    else {
        alert("Unrecognized email")
    }
}
/**
 * Helper function to setup the user's session storage with the necessary data and credentials
 * and redirect them to the proper place depending on whether they currently have a submitted
 * piece or not. If their piece was rejected, it notifies them and then redirects them to the form.
 * @author Nico Zeisler
 * @param studentDoc - The Firebase document with the student's account 
 * @param {String} email - The student's email
 */
async function studentLogin(studentDoc, email) {
    const snap = await getDocs(query(collection(db, "rejected"), where("email", "==", email)))
    if (!snap.empty) {
      for (const docSnap of snap.docs) {
        const reason = docSnap.data().text
        alert(reason)
        await deleteDoc(doc(db, "rejected", docSnap.id))
      }
      sessionStorage.setItem("email", email)
      sessionStorage.setItem("name", studentDoc.data().name)
      sessionStorage.setItem("credentialed", "we're in!")
      window.location.href = "form.html"
    }
    const firingTypes = ["glaze", "firstBisque", "secondBisque", "firing"]
    for (const firingType of firingTypes) {
        const snapshot = await getDocs(query(collection(db, firingType), where("email", "==", email)))
        if (!snapshot.empty) {
            sessionStorage.setItem("email", email);
            sessionStorage.setItem("name", studentDoc.data().name);
            sessionStorage.setItem("firingType", firingType)
            sessionStorage.setItem("credentialed", "we're in!")
            window.location.href = "status.html"
            return
        }
    }
    sessionStorage.setItem("email", email)
    sessionStorage.setItem("name", studentDoc.data().name)
    sessionStorage.setItem("credentialed", "we're in!")
    window.location.href = "form.html"
}
/**
 * Signup function that takes user input from the form for name and email and checks to 
 * see if they seem normal (i.e name is purely alphabetic) and alert otherwise. If everything
 * was acceptable it adds the account to the database and redirects the user to login
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
    const snapshot = await getDocs(query(collection(db, "accounts"), where("email", "==", email)))
    if (snapshot.empty) {
      /**
        * Added new paramters when an acount is created, for statistics later on (number of each piece)
        * @author Will Elias
      */
      await addDoc(collection(db, "accounts"), {
          name: username,
          email: email,
          password: password,
          num1stB: 0,
          num2ndB: 0,
          numGlaze: 0
      })
      window.location.href = "index.html"
    }
    else {
      alert("Email already taken")
    } 
}
/**
 * Utility to clear the user's session storage and redirect them to the landing page
 * @author Nico Zeisler
 */
export const logout = async function() {
    sessionStorage.clear()
    window.location.href = "index.html"
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
