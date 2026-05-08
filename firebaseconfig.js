// ════════════════════════════════════════════════════
//  Load Sahyog — Firebase Configuration
//  Loaded as type="module" before script.js / chatbot.js
// ════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── Your Firebase credentials (unchanged) ────────────
const firebaseConfig = {
    apiKey:            "AIzaSyA9xg51a_eZWB_yrEuisZItSzPQvDF_wjM",
    authDomain:        "load-sahyog-ca6f9.firebaseapp.com",
    projectId:         "load-sahyog-ca6f9",
    storageBucket:     "load-sahyog-ca6f9.firebasestorage.app",
    messagingSenderId: "390213211867",
    appId:             "1:390213211867:web:306430d7e334bd5dc99efe",
    measurementId:     "G-Z8PVQ4BLNL"
};

// ── Initialize Firebase ───────────────────────────────
let app, db;
try {
    app = initializeApp(firebaseConfig);
    db  = getFirestore(app);
    console.log("✅ Firebase connected successfully to Load Sahyog!");
} catch (error) {
    console.error("❌ Firebase connection error:", error);
}

// ── Collection Names (unchanged) ─────────────────────
const COLLECTIONS = {
    ENQUIRIES: 'enquiries',
    FEEDBACKS: 'feedbacks',
    USERS:     'users',
    TRUCKS:    'trucks',
    SHIPMENTS: 'shipments'
};

// ── FirestoreService class (unchanged) ────────────────
class FirestoreService {
    constructor(db) {
        this.db = db;
    }

    async addDocument(collectionName, data) {
        try {
            const docRef = await addDoc(collection(this.db, collectionName), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'active'
            });
            console.log(`✅ Document added to ${collectionName} with ID: ${docRef.id}`);
            return { success: true, id: docRef.id, data: { id: docRef.id, ...data } };
        } catch (error) {
            console.error(`❌ Error adding document:`, error);
            return { success: false, error: error.message };
        }
    }

    async getAllDocuments(collectionName, orderField = 'createdAt', orderDirection = 'desc') {
        try {
            const q        = query(collection(this.db, collectionName), orderBy(orderField, orderDirection));
            const snapshot = await getDocs(q);
            const documents = [];
            snapshot.forEach(d => documents.push({ id: d.id, ...d.data() }));
            return { success: true, data: documents };
        } catch (error) {
            console.error(`❌ Error fetching documents:`, error);
            return { success: false, error: error.message, data: [] };
        }
    }

    async getDocumentsWhere(collectionName, filters = [], orderField = null, orderDirection = 'desc', limitCount = null) {
        try {
            let q = collection(this.db, collectionName);
            filters.forEach(filter => {
                q = query(q, where(filter.field, filter.operator, filter.value));
            });
            if (orderField)  q = query(q, orderBy(orderField, orderDirection));
            if (limitCount)  q = query(q, limit(limitCount));

            const snapshot  = await getDocs(q);
            const documents = [];
            snapshot.forEach(d => documents.push({ id: d.id, ...d.data() }));
            return { success: true, data: documents };
        } catch (error) {
            console.error(`❌ Error filtering documents:`, error);
            return { success: false, error: error.message, data: [] };
        }
    }
}

// ── Expose globals so script.js & chatbot.js can use them ──
// (type="module" scripts are isolated, so we attach to window)
const firestoreService  = new FirestoreService(db);
window.db               = db;
window.firestoreService = firestoreService;
window.COLLECTIONS      = COLLECTIONS;

console.log("✅ Firestore Service Ready for Load Sahyog!");
