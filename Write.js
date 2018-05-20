/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* globals UrlFetchApp, checkForError_, createFirestoreDocument_, getObjectFromResponse_, removeTrailingSlash_ */

/**
 * Create a document with the given ID and fields.
 *
 * @param {string} path the path where the document will be written
 * @param {string} documentId the document's ID in Firestore
 * @param {object} fields the document's fields
 * @param {string} authToken an authentication token for writing to Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} the Document object written to Firestore
 */
function createDocumentWithId_ (path, documentId, fields, authToken, projectId) {
  const firestoreObject = createFirestoreDocument_(fields)

  const pathWithNoTrailingSlash = removeTrailingSlash_(path)
  var baseUrl = 'https://firestore.googleapis.com/v1beta1/projects/' + projectId + '/databases/(default)/documents/' + pathWithNoTrailingSlash
  if (documentId) {
    baseUrl += '?documentId=' + documentId
  }

  const options = {
    'method': 'post',
    'muteHttpExceptions': true,
    'payload': JSON.stringify(firestoreObject),
    'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + authToken}
  }

  const response = UrlFetchApp.fetch(baseUrl, options)
  const responseObj = getObjectFromResponse_(response)

  checkForError_(responseObj)

  return responseObj
}

/**
 * Create a document with the given fields and an auto-generated ID.
 *
 * @param {string} path the path where the document will be written
 * @param {object} fields the document's fields
 * @param {string} authToken an authentication token for writing to Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} the Document object written to Firestore
 */
function createDocument_ (path, fields, authToken, projectId) {
  return createDocumentWithId_(path, null, fields, authToken, projectId)
}

/**
 * Update/patch a document at the given path with new fields.
 *
 * @param {string} path the path of the document to update
 * @param {object} fields the document's new fields
 * @param {string} authToken an authentication token for writing to Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} the Document object written to Firestore
 */
function updateDocument_ (path, fields, authToken, projectId) {
  const firestoreObject = createFirestoreDocument_(fields)

  const baseUrl = 'https://firestore.googleapis.com/v1beta1/projects/' + projectId + '/databases/(default)/documents/' + path
  const options = {
    'method': 'patch',
    'muteHttpExceptions': true,
    'payload': JSON.stringify(firestoreObject),
    'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + authToken}
  }

  const response = UrlFetchApp.fetch(baseUrl, options)
  const responseObj = getObjectFromResponse_(response)
  checkForError_(responseObj)

  return responseObj
}
