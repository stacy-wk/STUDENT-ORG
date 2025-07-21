// server/services/firestoreService.js

import { db } from '../config/firebaseAdmin.js';
import admin from 'firebase-admin'; // Import admin for serverTimestamp

/**
 * Firestore Service Module
 * Provides a set of reusable functions for interacting with the Firestore database.
 * This abstracts away the direct Firestore API calls from controllers.
 */

// --- Basic CRUD Operations ---

/**
 * Gets all documents from a specified collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @returns {Promise<Array>} A promise that resolves to an array of documents, each with an 'id' field.
 */
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

/**
 * Gets a single document by its ID from a specified collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} documentId - The ID of the document to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the document data with 'id', or null if not found.
 */
const getDocumentById = async (collectionName, documentId) => {
  try {
    const docRef = db.collection(collectionName).doc(documentId);
    const doc = await docRef.get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    } else {
      // If the document does not exist, return null as intended.
      // Do NOT throw an error here, as it's a valid "not found" scenario.
      console.log(`Document with ID ${documentId} not found in ${collectionName}. Returning null.`);
      return null;
    }
  } catch (error) {
    // Only catch and re-throw if it's an actual database communication error,
    // not just a document not found scenario.
    // Firestore's 'NOT_FOUND' (code 5) is usually handled by doc.exists check.
    console.error(`Error getting document ${documentId} from ${collectionName}:`, error);
    throw new Error(`Failed to retrieve document ${documentId} due to a database error.`);
  }
};

/**
 * Adds a new document to a specified collection.
 * Firestore automatically generates an ID for the new document.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Object} data - The data for the new document.
 * @returns {Promise<Object>} A promise that resolves to the new document's ID and data.
 */
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

/**
 * Sets (creates or overwrites) a document with a specified ID in a collection.
 * Use this if you want to specify the document ID yourself.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} documentId - The ID of the document to set.
 * @param {Object} data - The data for the document.
 * @returns {Promise<void>} A promise that resolves when the document is set.
 */
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

/**
 * Updates an existing document in a specified collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} documentId - The ID of the document to update.
 * @param {Object} data - The fields to update in the document.
 * @returns {Promise<void>} A promise that resolves when the document is updated.
 */
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

/**
 * Deletes a document from a specified collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} documentId - The ID of the document to delete.
 * @returns {Promise<void>} A promise that resolves when the document is deleted.
 */
const deleteDocument = async (collectionName, documentId) => {
  try {
    await db.collection(collectionName).doc(documentId).delete();
    console.log(`Document ${documentId} deleted from ${collectionName}`);
  } catch (error) {
    console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
    throw new Error(`Failed to delete document ${documentId} from ${collectionName}.`);
  }
};

// --- Advanced/Specific Operations (Examples) ---

/**
 * Gets documents from a collection based on a query (e.g., by userId).
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Array<Array>} conditions - An array of [field, operator, value] arrays for querying.
 * Example: [['userId', '==', 'someUserId'], ['status', '==', 'active']]
 * @returns {Promise<Array>} A promise that resolves to an array of matching documents.
 */
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

// Export all functions to be used by controllers
export {
  getAllDocuments,
  getDocumentById,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByQuery,
};
