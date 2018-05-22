/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_|Fire|get" }] */
/* globals createDocument_, createDocumentWithId_, deleteDocument_, getAuthToken_, getDocument_, getDocuments_, getDocumentIds_, updateDocument_ */

/**
 * Get an object that acts as an authenticated interface with a Firestore project.
 *
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} an authenticated interface with a Firestore project
 */
function getFirestore (email, key, projectId) {
  return new Firestore(email, key, projectId)
}

/**
 * An object that acts as an authenticated interface with a Firestore project.
 *
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} an authenticated interface with a Firestore project
 */
var Firestore = function (email, key, projectId) {
  /**
   * The authentication token used for accessing Firestore.
   */
  const authToken = getAuthToken_(email, key)

  /**
   * Create a document with the given ID and fields.
   *
   * @param {string} documentId the document's ID in Firestore
   * @param {string} path the path where the document will be written
   * @param {object} fields the document's fields
   * @return {object} the Document object written to Firestore
   */
  this.createDocumentWithId = function (documentId, path, fields) {
    return createDocumentWithId_(path, documentId, fields, authToken, projectId)
  }

  /**
   * Create a document with the given fields and an auto-generated ID.
   *
   * @param {string} path the path where the document will be written
   * @param {object} fields the document's fields
   * @return {object} the Document object written to Firestore
   */
  this.createDocument = function (path, fields) {
    return createDocument_(path, fields, authToken, projectId)
  }

  /**
   * Update/patch a document at the given path with new fields.
   *
   * @param {string} path the path of the document to update
   * @param {object} fields the document's new fields
   * @return {object} the Document object written to Firestore
   */
  this.updateDocument = function (path, fields) {
    return updateDocument_(path, fields, authToken, projectId)
  }

  /**
   * Get a list of all documents in a collection.
   *
   * @param {string} pathToCollection the path to the collection
   * @return {object} an array of the documents in the collection
   */
  this.getDocuments = function (pathToCollection) {
    return getDocuments_(pathToCollection, authToken, projectId)
  }

  /**
   * Get a document.
   *
   * @param {string} path the path to the document
   * @return {object} the document object
   */
  this.getDocument = function (path) {
    return getDocument_(path, authToken, projectId)
  }

  /**
   * Get a list of all IDs of the documents in a collection.
   *
   * @param {string} pathToCollection the path to the collection
   * @return {object} an array of IDs of the documents in the collection
   */
  this.getDocumentIds = function (pathToCollection) {
    return getDocumentIds_(pathToCollection, authToken, projectId)
  }

  /**
   * Run a query against the Firestore Database and
   *  return an all the documents that match the query.
   * Must call .execute() to send the request.
   *
   * @param {string} path to check (can be repeated any number of times)
   * @return {object} the JSON response from the GET request
   */
  this.query = function () {
    const from = Array.prototype.slice.call(arguments);
    return query_(from, authToken, projectId);
  }
  
  /**
   * Delete the Firestore document at the given path.
   * Note: this deletes ONLY this document, and not any subcollections.
   *
   * @param {string} pathToDocument the path to the document to delete
   * @return {object} the JSON response from the DELETE request
   */
  this.deleteDocument = function (pathToDocument) {
    return deleteDocument_(pathToDocument, authToken, projectId)
  }
}
