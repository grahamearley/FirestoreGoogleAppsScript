/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* globals createFirestoreDocument_, removeTrailingSlash_ */

/**
 * Create a document with the given ID and fields.
 *
 * @private
 * @param {string} path the path where the document will be written
 * @param {string} documentId the document's ID in Firestore
 * @param {object} fields the document's fields
 * @param {string} request the Firestore Request object to manipulate
 * @return {object} the Document object written to Firestore
 */
function createDocument_ (path, documentId, fields, request) {
  const firestoreObject = createFirestoreDocument_(fields)
  const pathWithNoTrailingSlash = removeTrailingSlash_(path)

  if (documentId) { request.addParam('documentId', documentId) }
  return request.post(pathWithNoTrailingSlash, firestoreObject)
}

/**
 * Update/patch a document at the given path with new fields.
 *
 * @private
 * @param {string} path the path of the document to update
 * @param {object} fields the document's new fields
 * @param {string} request the Firestore Request object to manipulate
 * @return {object} the Document object written to Firestore
 */
function updateDocument_ (path, fields, request) {
  const firestoreObject = createFirestoreDocument_(fields)

  return request.patch(path, firestoreObject)
}
