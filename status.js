import {initializeApp} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"
import {getFirestore, collection, getDocs, query, where} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"

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
 * Username function retrieves the users name from session storage, and displays
 *  that name to a paragraph tag in the upper corner of the status page.
 * @author Will Elias
 * */ 
function userName() {
  const name = sessionStorage.getItem('name')
  const div = document.getElementById("username")
  div.textContent = "" + name
}

/**
 * GetStatus function, which creates a variable for the piece the user submmitted, using their email and firing 
 * type as values(which are both retrieved from session storage). The function then checks what the current status 
 * of the object is, and based on whether its unfired, firing, or fired. If the status is unfired or firing the function
 * will use the drawFileONCanvas function to display the imgae of the users piece, and additionally report what the status
 * is above it (unfired, firing). If the piece is fired, this function wont do anything, as the user has no piece submitted 
 * and thus would be brought to the form.html page.
 * 
 * @author Will Elias 
 * */ 

export const getStatus = async function() {
  const email = sessionStorage.getItem("email")
  const firingType = sessionStorage.getItem("firingType")
  const snapshot = await getDocs(query(collection(db, firingType), where("email", "==", email)))
  snapshot.forEach((doc) => {
    const status = doc.data().status
    if (status == "unfired") {
      const divVar2 = document.getElementById("centerbox")
      divVar2.textContent = "Your piece has been submitted."
    }
    if (status == "firing") {
      const divVar2 = document.getElementById("centerbox")
      divVar2.textContent = "Your piece is firing."
    }
    const img = doc.data().image
    drawFileOnCanvas(dataURLtoFile(img, "image.png"))
    sessionStorage.setItem("credentialed", null)
  })
}

function drawFileOnCanvas(file) {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    console.log(img)
    img.src = reader.result
    img.style.width = "30vw"
    img.style.height = "auto"
    img.style.marginTop = "5%"
    const center = document.getElementById("centerbox")
    center.appendChild(img)
  }
  reader.readAsDataURL(file)
}

/**
 * Helper function to convert dataUrls from firebase into usable image files
 * @author Will Elias
 * @param {Sting} dataurl - String representation of the image file in base64
 * @param {String} filename - Name for the file to take upon creation
 * @returns {File} File contained within the data url
 */
function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
}
userName()
getStatus()
