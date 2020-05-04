/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_|Fire|get" }] */

/**
 * Get an object that acts as an authenticated interface with a Firestore project.
 *
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @param {string} apiVersion [Optional] The Firestore API Version ("v1beta1", "v1beta2", or "v1")
 * @return {object} an authenticated interface with a Firestore project
 */
function getFirestore (email, key, projectId, apiVersion) {
  return new Firestore(email, key, projectId, apiVersion)
}

/**
 * An object that acts as an authenticated interface with a Firestore project.
 *
 * @constructor
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @param {string} apiVersion [Optional] The Firestore API Version ("v1beta1", "v1beta2", or "v1"). Defaults to "v1beta1"
 * @return {object} an authenticated interface with a Firestore project
 */
var Firestore = function (email, key, projectId, apiVersion) {
  if (!apiVersion) { apiVersion = 'v1beta1' }

  /**
    * The authentication token used for accessing Firestore.
    */
  const authToken = getAuthToken_(email, key, 'https://oauth2.googleapis.com/token')
  const basePath = 'projects/' + projectId + '/databases/(default)/documents/'
  const baseUrl = 'https://firestore.googleapis.com/' + apiVersion + '/' + basePath

  /**
   * Get a document.
   *
   * @param {string} path the path to the document
   * @return {object} the document object
   */
  this.getDocument = function (path) {
    const request = new FirestoreRequest_(baseUrl, authToken)
    return getDocument_(path, request)
  }

  /**
   * Get a list of all documents in a collection.
   *
   * @param {string} path the path to the collection
   * @param {array} ids [Optional] String array of document names to filter. Missing documents will not be included.
   * @return {object} an array of the documents in the collection
   */
  this.getDocuments = function (path, ids) {
    var docs
    if (!ids) {
      docs = this.query(path).execute()
    } else {
      const request = new FirestoreRequest_(baseUrl.replace('/documents/', '/documents:batchGet/'), authToken)
      docs = getDocuments_(basePath + path, request, ids)
    }
    return docs
  }

  /**
   * Get a list of all IDs of the documents in a path
   *
   * @param {string} path the path to the collection
   * @return {object} an array of IDs of the documents in the collection
   */
  this.getDocumentIds = function (path) {
    const request = new FirestoreRequest_(baseUrl, authToken)
    return getDocumentIds_(path, request)
  }

  /**
   * Create a document with the given fields and an auto-generated ID.
   *
   * @param {string} path the path where the document will be written
   * @param {object} fields the document's fields
   * @return {object} the Document object written to Firestore
   */
  this.createDocument = function (path, fields) {
    const request = new FirestoreRequest_(baseUrl, authToken)
    return createDocument_(path, fields, request)
  }

  /**
   * Update/patch a document at the given path with new fields.
   *
   * @param {string} path the path of the document to update. If document name not provided, a random ID will be generated.
   * @param {object} fields the document's new fields
   * @param {boolean} mask if true, the update will use a mask
   * @return {object} the Document object written to Firestore
   */
  this.updateDocument = function (path, fields, mask) {
    const request = new FirestoreRequest_(baseUrl, authToken)
    return updateDocument_(path, fields, request, mask)
  }

  /**
   * Run a query against the Firestore Database and return an all the documents that match the query.
   * Must call .execute() to send the request.
   *
   * @param {string} path to query
   * @return {object} the JSON response from the GET request
   */
  this.query = function (path) {
    const request = new FirestoreRequest_(baseUrl, authToken)
    return query_(path, request)
  }

  /**
   * Delete the Firestore document at the given path.
   * Note: this deletes ONLY this document, and not any subcollections.
   *
   * @param {string} path the path to the document to delete
   * @return {object} the JSON response from the DELETE request
   */
  this.deleteDocument = function (path) {
    const request = new FirestoreRequest_(baseUrl, authToken)
    return deleteDocument_(path, request)
  }
}
