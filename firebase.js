const fetch = require('node-fetch')
const firebase = require('firebase-admin')
const UUID = require('uuid-v4')

const firebaseConfig = {
  credential: firebase.credential.cert({
    type: process.env.GATSBY_FIREBASE_TYPE,
    project_id: process.env.GATSBY_FIREBASE_PROJECT_ID,
    private_key_id: process.env.GATSBY_FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.GATSBY_FIREBASE_PRIVATE_KEY[0] === '-' ? process.env.GATSBY_FIREBASE_PRIVATE_KEY : JSON.parse(process.env.GATSBY_FIREBASE_PRIVATE_KEY),
    client_email: process.env.GATSBY_FIREBASE_CLIENT_EMAIL,
    client_id: process.env.GATSBY_FIREBASE_CLIENT_ID,
    auth_uri: process.env.GATSBY_FIREBASE_AUTH_URI,
    token_uri: process.env.GATSBY_FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GATSBY_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GATSBY_FIREBASE_CLIENT_X509_CERT_URL
  }),
  apiKey: process.env.GATSBY_FIREBASE_API_KEY,
  authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.GATSBY_FIREBASE_DB_URL,
  projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.GATSBY_FIREBASE_SENDER_ID
}

firebase.initializeApp(firebaseConfig)

const save = async (details) => {
  const db = firebase.firestore()
  await db.collection('presets').doc(details.user.id + '-' + details.name).set(details, { merge: true })
}
const load = async (details) => {
  const db = firebase.firestore()
  return db.collection('presets').doc(details.user.id + '-' + details.name).get()
}

const storeImage = async (id, username, avatarURL) => {
  if (avatarURL) {
    const bucketName = 'ss-bitwig.appspot.com'
    const filename = 'discord-avatars/' + avatarURL.split('/').pop()
    const bucket = firebase.storage().bucket()
    const file = bucket.file(filename)
    let alreadyStored = false
    let uuid = UUID()

    try {
      const metadata = await file.getMetadata()
      alreadyStored = true
      uuid = metadata[0].metadata.firebaseStorageDownloadTokens
      console.log('avatar image already in. skipping upload')
    } catch (err) {
      console.log('image not in. uploading now...')
    }
    if (!alreadyStored) {
      const res = await fetch(avatarURL)
      const contentType = res.headers.get('content-type')
      const writeStream = file.createWriteStream({
        metadata: {
          contentType,
          metadata: {
            username: username,
            firebaseStorageDownloadTokens: uuid
          },
          predefinedAcl: 'publicRead'
        }
      })

      await res.body.pipe(writeStream)
    }
    const urlFile = encodeRFC5987ValueChars(filename)
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${urlFile}?alt=media&token=${uuid}`
    return fileUrl
  } else {
    return ''
  }
}

/**
 * encode url strings and replace chars
 * @param {url} str
 */
const encodeRFC5987ValueChars = (str) => {
  return encodeURIComponent(str)
    // Beachte, dass obwohl RFC3986 "!" reserviert, es nicht kodiert
    // werden muss, weil RFC5987 es nicht reserviert.
    .replace(/['()]/g, escape) // i.e., %27 %28 %29
    .replace(/\*/g, '%2A')
    // Die folgenden Zeichen müssen nicht nach RFC5987 kodiert werden,
    // daher können wir bessere Lesbarkeit übers Netzwerk sicherstellen:
    // |`^
    .replace(/%(?:7C|60|5E)/g, unescape)
}
module.exports = { save, load, storeImage }
