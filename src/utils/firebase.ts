import { FirebaseOptions, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig: FirebaseOptions = {
    apiKey: 'AIzaSyD4Oi_G7VS9xBMPK7ahJIq5gCt-FJ19irk',
    authDomain: 'portfolio-trello.firebaseapp.com',
    databaseURL:
        'https://portfolio-trello-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'portfolio-trello',
    storageBucket: 'portfolio-trello.appspot.com',
    messagingSenderId: '132905731762',
    appId: '1:132905731762:web:f81a63205d8568408babab',
}

const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
// export const dbRef = getFirestore(firebaseApp)
