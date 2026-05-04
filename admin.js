import {initializeApp} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"
import {getFirestore, collection, doc, getDocs, query, where, setDoc, getDoc, updateDoc, addDoc, deleteDoc, orderBy, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"

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
 * Queries firebase for all entries in a specified collection, converts the base64 data
 * to a url using a helper function, and then adds it to a target canvas. It also appends
 * a button with a function to reject the request (with a popup asking for a reason) and
 * a button to mark items as having started the firing process to move them to the firing queue
 * @author Nico Zeisler
 * @param {String} firingType - The firing type to display items of
 */
export const showItems = async function(firingType) {  
  /**
  * If statement thats triggered when the stats paged is pulled up. The page gets the users current stats from the 
  * accounts collection in firebase, and reflects how many of each piece a person has submitted in seperate divs.
  * @author Will Elias
  */ 
  if (firingType == "stats") {
    const column = document.getElementById("infoColumn")
    const results = await getDocs(query(collection(db, "accounts")))
    results.forEach(item => {
      const itemInfo = item.data()
      const box = document.createElement("div")
      box.className = 'statBox'
      box.innerHTML = itemInfo.name + "<br> Number of 1st Bisques: " + itemInfo.num1stB + "<br> Number of 2nd Bisques: " + itemInfo.num2ndB + "<br> Number of Glaze pieces: " + itemInfo.numGlaze
      column.appendChild(box)
    })
  }
  const column = document.getElementById("infoColumn")
  const snapshot = await getDocs(query(collection(db, firingType), orderBy("createdAt", "asc")))
  for(const item of snapshot.docs) {
    const filler = document.getElementById("filler")
    if (filler !== null) {
        filler.remove()
    }
    const info = item.data()
    const box = document.createElement("div")
    box.className = 'info-box'
    box.innerHTML = `
      <div class="info-title">${info.studentName}</div>
      <canvas class="placeHolderCanvas"></canvas>
      <div class="info-detail">${info.signature}</div>
    `
    drawFileOnCanvas(dataURLtoFile(info.image, "image.png"), box.querySelector("canvas")) 
    const startFiringButton = document.createElement("button")
    startFiringButton.className = "trigger"
    startFiringButton.innerHTML = "Start Firing"
    startFiringButton.onclick = async function() {
      await addDoc(collection(db, "firing"), {
          studentName: info.studentName,
          image: info.image,
          signature: info.signature,
          email: info.email,
          createdAt: serverTimestamp(),
          status: "firing"
      })
      /**
      * These three statements manage updates for a user acounts. So when a students pieces if fired,  
      * based on the firing type, the firebase account field that matches the students name, for that specific 
      * firing type will be updated to add another number(or piece) to their stat/field.
      * @author Will Elias
      */
      if (firingType == "firstBisque") {
        const snap = await getDocs(query(collection(db, "accounts"), where("name", "==", info.studentName)))
        const ittem = snap.docs[0]
        await updateDoc(doc(db, "accounts", ittem.id), { num1stB: ittem.data().num1stB + 1 })
      }
      else if (firingType == "secondBisque") {
        const snap = await getDocs(query(collection(db, "accounts"), where("name", "==", info.studentName)))
        const ittem = snap.docs[0]
        await updateDoc(doc(db, "accounts", ittem.id), { num2ndB: ittem.data().num2ndB + 1 })
      }
      else if (firingType == "glaze") {
        const snap = await getDocs(query(collection(db, "accounts"), where("name", "==", info.studentName)))
        const ittem = snap.docs[0]
        await updateDoc(doc(db, "accounts", ittem.id), { numGlaze: ittem.data().numGlaze + 1 })
      }
      await deleteDoc(doc(db, firingType, item.id))
      location.reload()
    }
    const rejectButton = document.createElement("button")
    rejectButton.className = "trigger"
    rejectButton.innerHTML = "Reject Request"
    rejectButton.onclick = async function() {
      const rationale = prompt("This piece was rejected because:", "") || "of unspecified reasons"
      await addDoc(collection(db, "rejected"), {
        text: "Your piece was rejected because " + rationale + ". Please resubmit with changes",
        email: info.email,
      })
      await deleteDoc(doc(db, firingType, item.id))
      const emailParams = {
        email: info.email,
        name: info.studentName,
        reason: rationale
      }
      await emailjs.send("service_r0bpoq7", "template_j208swa", emailParams)
      location.reload()
    }
    const artShowButton = document.createElement("button")
    artShowButton.innerHTML = "Submit to Art Show"
    artShowButton.onclick = async function() {
      await setDoc(doc(db, "artShow", item.id), {
          studentName: info.studentName,
          image: info.image,
          signature: info.signature,
          email: info.email,
          status: "firing"
      })
      artShowButton.remove()
    }
    box.appendChild(startFiringButton)
    box.appendChild(rejectButton)
    const docSnap =  await getDoc(doc(db, "artShow", item.id));
    if(!docSnap.exists()){
      box.appendChild(artShowButton)
    }
    column.appendChild(box)
  }
}
/**
 * Queries firebase for all entries in the currently firing collection, converts the base64 data
 * to a url using a helper function, and then adds it to a target canvas. It also appends
 * a button to mark items as having completed the firing process to delete them from the database
 * and send the user an email through our email service.
 * @author Nico Zeisler
 */
export const showFirings = async function() {
  const column = document.getElementById("infoColumn")
  const snapshot = await getDocs(query(collection(db, "firing")))
  snapshot.forEach(item => {
    const filler = document.getElementById("filler")
    if (filler !== null) {
        filler.remove()
    }
    const info = item.data()
    const box = document.createElement("div")
    box.className = 'info-box'
    box.innerHTML = `
      <div class="info-title">${info.studentName}</div>
      <canvas class="placeHolderCanvas"></canvas>
      <div class="info-detail">${info.signature}</div>
    `
    drawFileOnCanvas(dataURLtoFile(info.image, "image.png"), box.querySelector("canvas")) 
    column.appendChild(box)
  })
}
/**
 * Queries firebase for all entries in the currently artShow collection, converts the base64 data
 * to a url using a helper function, and then adds it to a target canvas. Also includes a remove
 * button in case the admin does not approve of the piece or it was submitted accidentally
 * @author Nico Zeisler
 */
export const showArtShow = async function() {
  const column = document.getElementById("infoColumn")
  const snapshot = await getDocs(query(collection(db, "artShow")))
  snapshot.forEach(item => {
    const filler = document.getElementById("filler")
    if (filler !== null) {
        filler.remove()
    }
    const info = item.data()
    const box = document.createElement("div")
    box.className = "info-box"
    box.innerHTML = `
      <div class="info-title">${info.studentName}</div>
      <canvas class="placeHolderCanvas"></canvas>
      <div class="info-detail">${info.signature}</div>
    `
    drawFileOnCanvas(dataURLtoFile(info.image, "image.png"), box.querySelector("canvas")) 
    const removeButton = document.createElement("button")
    removeButton.className = "trigger"
    removeButton.innerHTML = "Remove"
    removeButton.onclick = async function() {
      await deleteDoc(doc(db, "artShow", item.id))
      location.reload()
    }
    box.appendChild(removeButton)
    column.appendChild(box)
  })
}
/**
 * Updates firings whenever a user opens the page for the first time in a session
 * to finish all firings and send the appropriate emails 36 hours after they started firing
 * @author Nico Zeisler
 */
export const updateFirings = async function() {
  if (sessionStorage.getItem("updatedFirings") !== null) {return}  
  sessionStorage.setItem("updatedFirings", true)
  const firings = await getDocs(query(collection(db, "firing")))
  if (firings.empty) {return} 
  let info = firings.docs[0].data()
  const timestampMs = info.createdAt.toMillis()
  if (Date.now() - timestampMs >= 36 * 60 * 60 * 1000) {
    for (const item of firings.docs) {
      info = item.data()
      const emailParams = {
        email: info.email,
        name: info.studentName
      }
      await emailjs.send("service_r0bpoq7", "template_7log4f2", emailParams)
      deleteDoc(doc(db, "firing", item.id))
    }
  }
}
/**
 * Draws the given file on the given target canvas scaled down to meet width and/or
 * height constraints.
 * @author Nico Zeisler
 * @param {File} file - The image file to extract data from
 * @param {HTMLCanvasElement} canvas - The target canvas to draw the image on
 */
function drawFileOnCanvas(file, canvas) {
  const ctx = canvas.getContext('2d')
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const maxW = 200
      const maxH = 150
      let w = img.naturalWidth
      let h = img.naturalHeight
      const scale = Math.min(1, maxW / w, maxH / h)
      w = Math.round(w * scale)
      h = Math.round(h * scale)
      canvas.width = w
      canvas.height = h
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
    }
    img.src = reader.result
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
