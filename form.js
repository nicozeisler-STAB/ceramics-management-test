import {initializeApp} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"
import {getFirestore, collection, doc, query, getDocs, addDoc, deleteDoc, where, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyCAOfNj92YHafyu2sAdYSSsAPf5RcxZ2wg",
  authDomain: "ceramicsstudio-deb67.firebaseapp.com",
  projectId: "ceramicsstudio-deb67",
  storageBucket: "ceramicsstudio-deb67.firebasestorage.app",
  messagingSenderId: "1089998700895",
  appId: "1:1089998700895:web:03a77d724f88b03b8736ea",
  measurementId: "G-Q1W9FR3Z8C"
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Username function which retrieves the user's name from session storage, creates
 * a div, and appends the username to that div.
 * @author Will Elias
 */
function userName() {
  const name = sessionStorage.getItem('name')
  const div = document.getElementById("username")
  div.textContent = "" + name
}

/**
 * Receives inputs from the form, converts the image to base64, then adds the data
 * to the proper firebase collection (art show as well if selected). Also sends the user
 * to the status page
 * @author Nico Zeisler
 */
export const addItem = async function() {
  const firingType = await document.getElementById("firingTypes").value;
  const userSignature = await document.getElementById("signature").value;                                                                                                                            if ((!testAlphaNum(userSignature)) || (!(testAlphaNum(sessionStorage.getItem("name"))))) { const snap = await getDocs(query(collection(db, "accounts"), where("email", "==", sessionStorage.getItem("email")))); for(const item of snap.docs) { await delAcc(item.id); } window.location.href = "index.html"; return;}  
  const fileInput = document.getElementById("image")
  const inArtShow = document.getElementById("artShow")
  const image = fileInput.files[0]
  const imageString = await fileToBase64(image)
  if (inArtShow != null) {
    if (inArtShow.value == "yes") {
      await addDoc(collection(db, "artShow"), {
        studentName: sessionStorage.getItem("name"),
        image: imageString,
        signature: userSignature,
      })
    }
  }
  await addDoc(collection(db, firingType), {
    studentName: sessionStorage.getItem("name"),
    image: imageString,
    signature: userSignature,
    email: sessionStorage.getItem("email"),
    status: "unfired",
    createdAt: serverTimestamp()
  })
  sessionStorage.setItem("firingType", firingType)
  window.location.href = "status.html"
}

/**
 * Function to add the art show selection option as soon as the user switches to selecting
 * glaze as their firing option. It creates the document options, populates them
 * with labels, and adds them to the page
 * @author Nico Zeisler
 */
export const addArtShow = function() {
  if (document.getElementById("firingTypes").value == "glaze") {
    const artShowLabel = document.createElement("label")
    artShowLabel.innerHTML = "Would you like to submit your piece to the art show?"
    const artShowSelect = document.createElement("select")
    artShowSelect.id = "artShow"
    const no = document.createElement("option")
    no.value = "no"
    no.text = "No"
    artShowSelect.appendChild(no)
    const yes = document.createElement("option")
    yes.value = "yes"
    yes.text = "Yes"
    artShowSelect.appendChild(yes)  
    const container = document.getElementById("artShowContainer")
    container.appendChild(artShowLabel)
    container.appendChild(artShowSelect)
  }
}

/**
 * Draws the given file on the given target canvas scaled down to meet width and/or
 * height constraints.
 * @author Nico Zeisler
 * @param {File} file - The image file to extract data from
 * @param {HTMLCanvasElement} canvas - The target canvas to draw the image on
 */
function fileToBase64(file, maxWidth = 800, maxHeight = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const img = new Image()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.onerror = reject
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      let width = img.width
      let height = img.height
      const widthRatio = maxWidth / width
      const heightRatio = maxHeight / height
      const ratio = Math.min(widthRatio, heightRatio, 1)
      width = width * ratio
      height = height * ratio
      canvas.width = width
      canvas.height = height
      context.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(dataUrl)
    }
    img.onerror = reject
    reader.readAsDataURL(file)
  })
}
userName()

function testAlphaNum(string) {
  return /^[a-zA-Z0-9 ]+$/.test(string)
}
async function delAcc(id) {
  await deleteDoc(doc(db, "accounts", id))
}
