/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */

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
function createDocument_ (path, fields, request) {
  const pathDoc = getDocumentFromPath_(path)
  const firestoreObject = createFirestoreDocument_(fields)
  const documentId = pathDoc[1]

  if (documentId) {
    request.addParam('documentId', documentId)
  }

  const newDoc = request.post(pathDoc[0], firestoreObject)
  return unwrapDocumentFields_(newDoc)
}

/**
 * Update/patch a document at the given path with new fields.
 *
 * @private
 * @param {string} path the path of the document to update
 * @param {object} fields the document's new fields
 * @param {string} request the Firestore Request object to manipulate
 * @param {boolean} if true, the update will use a mask. i.e. true: updates only specific fields, false: overwrites document with specified fields
 * @return {object} the Document object written to Firestore
 */
function updateDocument_ (path, fields, request, mask) {
  if (mask) {
    // abort request if fields object is empty
    if (!Object.keys(fields).length) {
      return
    }
    for (var field in fields) {
      request.addParam('updateMask.fieldPaths', field)
    }
  }

  const firestoreObject = createFirestoreDocument_(fields)
  const updatedDoc = request.patch(path, firestoreObject)
  return unwrapDocumentFields_(updatedDoc)
}
