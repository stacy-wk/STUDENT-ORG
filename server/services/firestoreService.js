import { db } from '../config/firebaseAdmin.js';
import admin from 'firebase-admin'; // Admin for serverTimestamp


// Basic CRUD Ops
const getAllDocuments = async (collectionName) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return documents;
  } catch (error) {
    console.error(`Error getting all documents from ${collectionName}:`, error);
    throw new Error(`Failed to retrieve documents from ${collectionName}.`);
  }
};


const getDocumentById = async (collectionName, documentId) => {
  try {
    const docRef = db.collection(collectionName).doc(documentId);
    const doc = await docRef.get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    } else {
      console.log(`Document with ID ${documentId} not found in ${collectionName}. Returning null.`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${documentId} from ${collectionName}:`, error);
    throw new Error(`Failed to retrieve document ${documentId} due to a database error.`);
  }
};


const addDocument = async (collectionName, data) => {
  try {
    const timestampedData = {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection(collectionName).add(timestampedData);
    console.log(`Document added with ID: ${docRef.id} to ${collectionName}`);
    return { id: docRef.id, ...timestampedData };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw new Error(`Failed to add document to ${collectionName}.`);
  }
};


const setDocument = async (collectionName, documentId, data) => {
  try {
    const timestampedData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection(collectionName).doc(documentId).set(timestampedData, { merge: true });
    console.log(`Document ${documentId} set/updated in ${collectionName}`);
  } catch (error) {
    console.error(`Error setting document ${documentId} in ${collectionName}:`, error);
    throw new Error(`Failed to set document ${documentId} in ${collectionName}.`);
  }
};


const updateDocument = async (collectionName, documentId, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection(collectionName).doc(documentId).update(updateData);
    console.log(`Document ${documentId} updated in ${collectionName}`);
  } catch (error) {
    console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
    throw new Error(`Failed to update document ${documentId} in ${collectionName}.`);
  }
};


const deleteDocument = async (collectionName, documentId) => {
  try {
    await db.collection(collectionName).doc(documentId).delete();
    console.log(`Document ${documentId} deleted from ${collectionName}`);
  } catch (error) {
    console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
    throw new Error(`Failed to delete document ${documentId} from ${collectionName}.`);
  }
};

// Advanced Ops
const getDocumentsByQuery = async (collectionName, conditions) => {
  try {
    let queryRef = db.collection(collectionName);
    conditions.forEach(condition => {
      queryRef = queryRef.where(condition[0], condition[1], condition[2]);
    });

    const snapshot = await queryRef.get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return documents;
  } catch (error) {
    console.error(`Error querying documents in ${collectionName}:`, error);
    throw new Error(`Failed to query documents in ${collectionName}.`);
  }
};

export {
  getAllDocuments,
  getDocumentById,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByQuery,
};
