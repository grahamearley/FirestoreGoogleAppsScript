/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */

/**
 * Delete the Firestore document at the given path.
 * Note: this deletes ONLY this document, and not any subcollections.
 *
 * @private
 * @param {string} path the path to the document to delete
 * @param {string} request the Firestore Request object to manipulate
 * @return {object} the JSON response from the DELETE request
 */
function deleteDocument_ (path, request) {
  return request.remove(path)
}
